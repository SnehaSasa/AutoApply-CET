(function () {

  if (window.__AUTOAPPLY_ALREADY_RUNNING__) {
    console.log("[AutoApply] Script already active — skipping duplicate load");
    return;
  }

  window.__AUTOAPPLY_ALREADY_RUNNING__ = true;
  console.log("[AutoApply] Script initialized");
  console.log('[AutoApply] contentScript loaded');

  const SEMANTIC_CONFIDENCE_THRESHOLD = 0.45; // tuneable

  function flattenObject(obj, parent = "", res = {}) {
    for (let key in obj) {
        const newKey = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            flattenObject(obj[key], newKey, res);
        } else {
            res[newKey] = obj[key];
        }
    }
    return res;
  }


  // ---------------- Helpers ----------------
  function findFormFields() {
    const selectors =
      'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
    return Array.from(document.querySelectorAll(selectors)).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        el.offsetParent !== null
      );
    });
  }

  function highlight(el) {
    const prev = el.style.boxShadow;
    el.style.boxShadow = '0 0 0 3px rgba(255,200,0,0.6)';
    setTimeout(() => {
      el.style.boxShadow = prev;
    }, 1600);
  }

  async function readKnowledgeBase() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['knowledgeBase'], (res) =>
        resolve(res.knowledgeBase || {})
      );
    });
  }

  async function saveKbKey(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['knowledgeBase'], (res) => {
        const kb = res.knowledgeBase || {};
        kb[key] = value;
        chrome.storage.local.set({ knowledgeBase: kb }, () => resolve(true));
      });
    });
  }

  async function typeLikeHuman(el, text, charDelay = 20) {
    el.focus();
    const tag = el.tagName.toLowerCase();
    if (tag === 'select') {
      const opts = Array.from(el.options);
      let chosen = opts.find(
        (o) =>
          o.value === text ||
          (o.text && o.text.trim().toLowerCase() === text.trim().toLowerCase())
      );
      if (!chosen)
        chosen = opts.find(
          (o) =>
            o.text &&
            o.text.trim().toLowerCase().includes(text.trim().toLowerCase())
        );
      if (chosen) {
        el.value = chosen.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    if (el.type === 'checkbox' || el.type === 'radio') return;
    el.value = '';
    for (let i = 0; i < String(text).length; i++) {
      el.value += String(text)[i];
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, charDelay));
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function extractLabel(el) {
    const placeholder = (el.getAttribute('placeholder') || '').trim();
    let label = '';
    const id = el.id;
    if (id) {
      const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lab) label = lab.innerText || lab.textContent || '';
    }
    if (!label) {
      const parentLabel = el.closest('label');
      if (parentLabel) label = parentLabel.innerText || parentLabel.textContent || '';
    }
    if (!label)
      label += ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.title || '');
    const name = el.name || '';
    return `${label} ${placeholder} ${name}`.trim().toLowerCase();
  }

  function normalizeLabel(text) {
    if (!text) return '';
    let norm = text
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[:-]/g, ' ')
      .replace(/—/g, "-")  
      .replace(/[^a-z0-9'". ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();


        // map common human phrases into canonical keys
    if (norm.includes('surname') || norm.includes('last name') || norm.includes('family name')) {
      norm = 'family_name';
    } else if (norm.includes('father') || norm.includes('dad') || norm.includes("father's name")) {
      norm = 'father_name';
    } else if (norm.includes('mother') || norm.includes("mother's name") || norm.includes('mom')) {
      norm = 'mother_name';
    } else if (norm.includes('pin') || norm.includes('pincode') || norm.includes('pin code') || norm.includes('zip') || norm.includes('postal')) {
      norm = 'postal_code';
    } else if (norm.includes('first name') || norm.includes('given name') || norm.includes('forename')) {
      norm = 'first_name';
    } else if (norm.includes('full name')) {
      norm = 'full_name';
    } else if (norm.includes('address line 1') || norm.includes('street address') || norm.includes('house')) {
      norm = 'address_line_1';
    } else if (norm.includes('address line 2') || norm.includes('locality') || norm.includes('area')) {
      norm = 'address_line_2';
    } else if (norm.includes('address line 3') || norm.includes('city') || norm.includes('district') || norm.includes('state')) {
      norm = 'address_line_3';
    }


    return norm;
  }


  function deepFindTopKey(obj, labelText) {
    const search = (l) => l.toLowerCase().replace(/[_\s]+/g, ' ').trim();
    const target = search(labelText);

    for (const k in obj) {
      if (!obj.hasOwnProperty(k)) continue;

      const readable = search(k);
      if (target.includes(readable) || readable.includes(target)) return k;

      const v = obj[k];
      if (v && typeof v === 'object') {
        for (const subk in v) {
          if (!v.hasOwnProperty(subk)) continue;

          const subr = search(subk);
          if (target.includes(subr) || subr.includes(target)) return k;
        }
      }
    }
    return null;
  }


  async function fillInput(el, value) {
    try {
      const tag = el.tagName.toLowerCase();

      if (tag === 'select') {
        const options = Array.from(el.options);
        const match = options.find(
          (o) =>
            o.text.trim().toLowerCase() === String(value).trim().toLowerCase() ||
            o.value.trim().toLowerCase() === String(value).trim().toLowerCase()
        );
        if (match) {
          el.value = match.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
      }

      if (el.type === 'checkbox' || el.type === 'radio') {
        const valStr = String(value).toLowerCase();
        el.checked = valStr === 'yes' || valStr === 'true' || valStr === '1';
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      if (el.type === 'date') {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      await typeLikeHuman(el, value);
    } catch (err) {
      console.warn('[AutoApply] fillInput failed', err);
    }
  }

  // ---------------- Date helpers ----------------
  function parseIsoDate(iso) {
    if (!iso) return null;
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return { yyyy: m[1], mm: m[2], dd: m[3] };
  }

  function formatDateForInput(kbIsoDate, inputEl) {
    const parsed = parseIsoDate(kbIsoDate);
    if (!parsed) return null;

    if (inputEl.tagName.toLowerCase() === 'input' && inputEl.type === 'date') {
      return `${parsed.yyyy}-${parsed.mm}-${parsed.dd}`;
    }

    const placeholder = (inputEl.getAttribute('placeholder') || '').toLowerCase();
    const dataFmt = (inputEl.getAttribute('data-format') || '').toLowerCase();
    const fmtHint = dataFmt || placeholder;

    if (fmtHint.includes('dd/mm') || fmtHint.includes('dd-mm') || fmtHint.includes('dd mm')) return `${parsed.dd}/${parsed.mm}/${parsed.yyyy}`;
    if (fmtHint.includes('mm/dd') || fmtHint.includes('mm-dd')) return `${parsed.mm}/${parsed.dd}/${parsed.yyyy}`;
    if (fmtHint.includes('yyyy/mm/dd') || fmtHint.includes('yyyy-mm-dd')) return `${parsed.yyyy}-${parsed.mm}-${parsed.dd}`;

    return `${parsed.dd}/${parsed.mm}/${parsed.yyyy}`;
  }

  async function setDateField(inputEl, kbIsoDate) {
    const formatted = formatDateForInput(kbIsoDate, inputEl);
    if (!formatted) return false;
    inputEl.value = formatted;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // ---------------- Course normalization ----------------
  const COURSE_ALIASES = {
    'computer science and engineering': ['computer science', 'cs', 'cse', 'computer science & engineering', 'btech cs', 'b.tech cse', 'b.tech computer science'],
  };

  function normalizeCourseText(inputText) {
    if (!inputText) return null;
    // const t = inputText.trim().toLowerCase();
    const t = String(inputText).trim().toLowerCase();

    for (const canonical of Object.keys(COURSE_ALIASES)) {
      const syns = COURSE_ALIASES[canonical];
      for (const s of syns) {
        if (t.includes(s)) return canonical;
      }
    }
    return null;
  }


  // ---------- Replacement: semantic-first lookup (paste in place of old findMatchingKey) ----------
  async function semanticLookupRemote(labelText) {
    // call backend semantic search
    try {
      const resp = await fetch('http://127.0.0.1:8000/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: labelText, top_k: 3 })
      });
      if (!resp.ok) {
        console.warn('[AutoApply] semanticLookupRemote: backend returned non-ok', resp.status);
        return null;
      }
      const data = await resp.json();
      if (!data || !data.results || data.results.length === 0) return null;
      return data.results; // array of {best_label, score, ...}
    } catch (err) {
      console.warn('[AutoApply] semanticLookupRemote error', err);
      return null;
    }
  }

  /**
   * canonical alias map: local fallback for common label synonyms.
   * If you want more coverage add entries here.
   */
  const LOCAL_CANONICAL_ALIASES = {
    'last name': 'family_name',
    'surname': 'family_name',
    'family name': 'family_name',
    'father name': 'father_name',
    "father's name": 'father_name',
    'dad name': 'father_name',
    'mother name': 'mother_name',
    "mother's name": 'mother_name',
    'full address': 'full_adress',
    'current address': 'full_address',
    'address': 'full_address',
    'city':'city',
    'locality':'city',
    'pin': 'postal_code',
    'pincode': 'postal_code',
    'pin code': 'postal_code',
    'zip': 'postal_code',
    'zip code': 'postal_code',
    'postal code': 'postal_code',
    'phone': 'phone',
    'mobile': 'phone',
    'first name': 'first_name',
    'given name': 'first_name',
    'full name': 'full_name',
    'address line 1': 'address_line_1',
    'address line 2': 'address_line_2',
    'address line 3': 'address_line_3',
    'college': 'college_name',
    'university': 'college_name',
    'institute': 'college_name',
    'school': 'college_name',
    'course' : 'course',
    'program' : 'course',
    'specialization' : 'course',
    'major' : 'course',
    'field of study' : 'course',
    'branch' : 'course',
    'discipline' : 'course',
    'subject stream' : 'course',
    'graduation year': 'graduation_year',
    'graduated year': 'graduation_year',
    'passing year': 'graduation_year',
    'passout year': 'graduation_year',
    'year of graduation': 'graduation_year',
    'year of passing': 'graduation_year',
    'year of completion': 'graduation_year',
    'degree' : 'degree',
    'qualification' : 'degree',
    'academic degree' : 'degree',
    'bachelor degree' : 'degree',
    'engineering degree"' : 'degree',
    'ug degree' : 'degree',
    'current organization': 'current_org_name',
    'current company': 'current_org_name',
    'current employer': 'current_org_name',
    'company name': 'current_org_name',
    'organization name': 'current_org_name',
    'job title': 'current_org_position',
    'current position': 'current_org_position',
    'position': 'current_org_position',
    'role': 'current_org_position',
    'job role': 'current_org_position',
    'employment start date': 'current_org_start_date',
    'start date': 'current_org_start_date',
    'date of joining': 'current_org_start_date',
    'joining date': 'current_org_start_date',
    'start working from': 'current_org_start_date',
    'employment end date': 'current_org_end_date',
    'end date': 'current_org_end_date',
    'last working day': 'current_org_end_date',
    'worked till': 'current_org_end_date',
    'current job location': 'current_org_location',
    'work location': 'current_org_location',
    'job location': 'current_org_location',
    'company location': 'current_org_location',
    'responsibilities': 'current_org_responsibilities',
    'job responsibilities': 'current_org_responsibilities',
    'roles and responsibilities': 'current_org_responsibilities',
    'duties': 'current_org_responsibilities',
    'job description': 'current_org_responsibilities',
    'tasks performed': 'current_org_responsibilities',
    'internship': 'internships',
    'internships': 'internships',
    'internship experience': 'internships'

  };

  const INTERNSHIP_FIELD_MAP = {
    "company": "company_name",
    "company name": "company_name",
    "organisation": "company_name",
    "organization": "company_name",
    "Internship - company name": "company_name",

    "position": "position",
    "role": "position",
    "designation": "position",

    "location": "location",
    "city": "location",

    "responsibilities": "responsibilities",
    "tasks": "responsibilities",

    "start date": "start_date",
    "from": "start_date",

    "end date": "end_date",
    "till": "end_date",
  };



  // ---------------- Custom KB Handler (Internships, Courses, etc.) ----------------
  function handleFormInput(formInput, knowledgeBase) {
      if (!formInput) return "Field not found";

      const field = formInput.trim().toLowerCase();
      const canonicalField = LOCAL_CANONICAL_ALIASES[field];

      // ---- Internship handler ----
      if (canonicalField === 'internships') {
          const indexMatch = formInput.match(/internship\s*(\d+)/i)?.[1];

          if (indexMatch) {
              const idx = parseInt(indexMatch) - 1;
              const internship = knowledgeBase.internships?.[idx];
              return internship ? internship : 'No internship details found';
          }

          if (field.includes('{}')) {
              return knowledgeBase.internships || [];
          }

          return knowledgeBase.internships?.[0] || "No internship details found";
      }

      // ---- Other fields can be added here ----
      return "Field not found";
  }


  function lookupAliasLocally(labelText) {
    // normalize input
    const s = (labelText || '').toLowerCase().trim();
    if (!s) return null;
    // exact alias map
    if (LOCAL_CANONICAL_ALIASES[s]) return LOCAL_CANONICAL_ALIASES[s];
    // fuzzy check: contains
    for (const key in LOCAL_CANONICAL_ALIASES) {
      if (s.includes(key)) return LOCAL_CANONICAL_ALIASES[key];
    }
    return null;
  }


  async function findMatchingKey(labelText, kb) {
    if (!labelText) {
        console.warn('[AutoApply] labelText empty');
        return null;
    }

    // 0. Normalization
    const norm = String(labelText).toLowerCase().trim();
    console.log(`[AutoApply] Searching for label: "${norm}" in KB`);

    // 1. Deep key search
    const deepKey = deepFindTopKey(kb, norm);
    if (deepKey) {
        return { key: deepKey, value: kb[deepKey], method: "deep-key" };
    }

    // 2. Local alias lookup
    const localCanon = lookupAliasLocally(norm);
    if (localCanon && kb[localCanon] !== undefined) {
        return { key: localCanon, value: kb[localCanon], method: 'local-alias' };
    }

    // 3. Semantic lookup (PRIMARY) – use normalized label
    let semResults = await semanticLookupRemote(norm);

    // 3b. If poor result, try human-friendly version
    if (!semResults || semResults.length === 0) {
        const semQuery = norm.replace(/_/g, ' ').trim();
        semResults = await semanticLookupRemote(semQuery);
    }

    if (semResults && semResults.length > 0) {
        for (const r of semResults) {
            if (!r || !r.best_label) continue;

            const label = String(r.best_label);
            const score = Number(r.score || 0);

            // Fix degree mis-matching
            if (label.toLowerCase().includes("degree") && kb["degree"] !== undefined) {
                return { key: "degree", value: kb["degree"], score, method: "semantic-degree" };
            }

            const altKey = label.replace(/\./g, '_').replace(/\s+/g, '_').toLowerCase();
            if (kb[altKey] !== undefined) {
                return { key: altKey, value: kb[altKey], score, method: 'semantic-alt' };
            }

            const local = lookupAliasLocally(label.toLowerCase());
            if (local && kb[local] !== undefined) {
                return { key: local, value: kb[local], score, method: 'semantic-localalias' };
            }
        }

        console.warn('[AutoApply] Semantic returned labels but none matched KB:', 
            semResults.map(r => r.best_label));
    }

    // 4. Fallback scan
    for (const k in kb) {
        if (!kb.hasOwnProperty(k)) continue;
        const readable = k.replace(/[_.\[\]]+/g, ' ').toLowerCase();
        if (norm.includes(readable) || readable.includes(norm)) {
            return { key: k, value: kb[k], method: 'fallback-scan' };
        }
    }

    // 5. No match
    return null;
  }



  
// Debug semantic lookup
  // ---------------- Test Semantic Lookup ----------------
  async function testSemanticLookup(kb) {
      const fieldsToTest = ["father_name", "family_name", "postal_code"];
      for (let field of fieldsToTest) {
          const value = await findMatchingKey(field, kb);
          if (value) {
              console.log(`[Debug] ${field}:`, value);
          } else {
              console.log(`[Debug] ${field}: No match found`);
          }
      }
  }

  function semanticMatch(label, map) {
    const t = label.toLowerCase();

    for (const alias in map) {
        if (t.includes(alias)) {
            return map[alias];
        }
    }
    return null;
  }



  let internshipIndex = 0;

  async function fillInternshipField(label, inputEl, internships) {

    if (!internships || !Array.isArray(internships) || internships.length === 0) {
        console.log("[AutoApply] No internship data in KB");
        return false;
    }

    // prevent overflow
    if (internshipIndex >= internships.length) {
        internshipIndex = internships.length - 1;
    }

    const fieldKey = semanticMatch(label, INTERNSHIP_FIELD_MAP);
    if (!fieldKey) return false;

    const currentInternship = internships[internshipIndex];
    if (!currentInternship) return false;

    const value = currentInternship[fieldKey];
    if (!value) return false;

    await fillInput(inputEl, value);

    // Only increment index when responsibilities filled (last field)
    if (fieldKey === "responsibilities") {
        internshipIndex++;
    }

    return true;
  }

  // ---------- Skills helpers & UI storage (paste here) ----------

// Remember last chosen role (saved in chrome.storage.local as 'last_selected_role')
  function getLastSelectedRole() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['last_selected_role'], (res) => {
        resolve(res.last_selected_role || null);
      });
    });
  }
  function setLastSelectedRole(role) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ last_selected_role: role }, () => resolve(true));
    });
  }

  /**
   * pickSkillsForRole(role, kb)
   * - kb.skills is an ARRAY of blocks: [{applicable_roles:[], skills_to_enter:[]}, ...]
   * - returns {skills: [...], matchedBlockIndex: n} or null if none matched
   * Matching strategy:
   *  1. Exact (case-insensitive) role match in applicable_roles
   *  2. Token fuzzy: any applicable_role string included in user role OR user role included in applicable_role
   *  3. Word-level partial match: split words and check overlap
   */
  function pickSkillsForRole(role, kb) {
    if (!role || !kb || !Array.isArray(kb.skills)) return null;
    const r = String(role).trim().toLowerCase();
    // 1) exact or case-insensitive
    for (let i = 0; i < kb.skills.length; i++) {
      const block = kb.skills[i];
      if (!block || !Array.isArray(block.applicable_roles)) continue;
      for (const ar of block.applicable_roles) {
        if (!ar) continue;
        if (ar.toLowerCase() === r) return { skills: block.skills_to_enter || block.skills || [], matchedBlockIndex: i };
      }
    }
    // 2) contains / included
    for (let i = 0; i < kb.skills.length; i++) {
      const block = kb.skills[i];
      if (!block || !Array.isArray(block.applicable_roles)) continue;
      for (const ar of block.applicable_roles) {
        if (!ar) continue;
        const a = ar.toLowerCase();
        if (a.includes(r) || r.includes(a)) {
          return { skills: block.skills_to_enter || block.skills || [], matchedBlockIndex: i };
        }
      }
    }
    // 3) word overlap score
    const roleWords = new Set(r.split(/\W+/).filter(Boolean));
    for (let i = 0; i < kb.skills.length; i++) {
      const block = kb.skills[i];
      if (!block || !Array.isArray(block.applicable_roles)) continue;
      for (const ar of block.applicable_roles) {
        if (!ar) continue;
        const arWords = new Set(ar.toLowerCase().split(/\W+/).filter(Boolean));
        // compute intersection size
        let common = 0;
        for (const w of roleWords) if (arWords.has(w)) common++;
        if (common >= 1) return { skills: block.skills_to_enter || block.skills || [], matchedBlockIndex: i };
      }
    }
    // none matched
    return null;
  }

  /**
   * typeSkillAndEnter(el, text)
   * - types text into el using typeLikeHuman then dispatches Enter key event
   * - returns a Promise that resolves when events dispatched
   */
  async function typeSkillAndEnter(el, text, charDelay = 25) {
    if (!el || text === undefined || text === null) return false;
    // if element is select, we fall back to fillInput logic
    const tag = el.tagName.toLowerCase();
    if (tag === 'select') {
      await fillInput(el, text);
      return true;
    }

    // focus and type characters like typeLikeHuman
    el.focus();
    // Many skill fields are single-line input; clear first
    try { el.value = ''; } catch (e) {}
    for (let i = 0; i < String(text).length; i++) {
      const ch = String(text)[i];
      try {
        el.value += ch;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {}
      await new Promise((r) => setTimeout(r, charDelay));
    }

    // fire Enter key events so tag-type inputs accept the skill
    try {
      const down = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
      const press = new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
      const up = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
      el.dispatchEvent(down);
      el.dispatchEvent(press);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(up);
    } catch (e) {
      // fallback: blur to trigger any tag creation
      try { el.blur(); } catch (e2) {}
    }

    // small delay to let UI process tag creation
    await new Promise((r) => setTimeout(r, 180));
    return true;
  }

  /**
   * handleSkillsField(inputEl, kb)
   * - Prompts user for role (unless last role remembered and user accepts)
   * - Uses pickSkillsForRole to get skills array
   * - Types each skill and presses Enter
   * - Returns true if handled, false otherwise
   */
  async function handleSkillsField(inputEl, kb) {
    if (!inputEl) return false;
    // 1. If kb.skills not available, bail
    if (!kb || !Array.isArray(kb.skills) || kb.skills.length === 0) {
      console.warn('[AutoApply] No skills blocks found in KB.');
      return false;
    }

    // 2. ask user for role (option A) but reuse previously remembered role if user accepts
    let lastRole = await getLastSelectedRole();
    let role = null;

    if (lastRole) {
      // ask user whether to reuse
      const reuse = confirm(`Previously you selected role: "${lastRole}". Reuse this role for skills? (OK = reuse, Cancel = choose new)`);
      if (reuse) {
        role = lastRole;
      }
    }

    if (!role) {
      role = prompt('Which job role are you applying for? (e.g. "Gen AI Engineer", "Data Scientist")');
      if (!role || !String(role).trim()) {
        console.warn('[AutoApply] No role entered by user. Aborting skills fill.');
        return false;
      }
      // remember it for later
      await setLastSelectedRole(role.trim());
    }

    // 3. pick skills
    const pick = pickSkillsForRole(role, kb);
    if (!pick || !Array.isArray(pick.skills) || pick.skills.length === 0) {
      // no matching skill block found
      alert(`No skill-set in knowledge base matched "${role}". Autofill will skip skills.`);
      return false;
    }

    // 4. type skills one-by-one into inputEl
    for (const s of pick.skills) {
      if (!s) continue;
      // type skill and press enter
      await typeSkillAndEnter(inputEl, s);
      // wait a bit for UI to settle
      await new Promise((r) => setTimeout(r, 200));
    }

    // done
    console.log(`[AutoApply] Entered ${pick.skills.length} skills for role "${role}".`);
    return true;
  }

  // -----------------------------------------------------
// Resume selection + upload logic
// -----------------------------------------------------

  async function getLastSelectedRole() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['last_selected_role'], (res) => {
        resolve(res.last_selected_role || null);
      });
    });
  }


  // MATCHER: picks the correct resume for the saved job role
  function pickResumeForRole(role, kb) {
    if (!role || !kb || !kb.resumes) return null;

    const r = String(role).trim().toLowerCase();
    const resumes = kb.resumes;
    const resumeNames = Object.keys(resumes);

    // 1 — Exact case-insensitive match
    for (const name of resumeNames) {
      const block = resumes[name];
      if (!block || !Array.isArray(block.keywords)) continue;
      for (const k of block.keywords) {
        if (k.toLowerCase() === r)
          return { resumeName: name, resumeURL: block.url };
      }
    }

    // 2 — substring/contains matching
    for (const name of resumeNames) {
      const block = resumes[name];
      if (!block || !Array.isArray(block.keywords)) continue;
      for (const k of block.keywords) {
        const kw = k.toLowerCase();
        if (kw.includes(r) || r.includes(kw))
          return { resumeName: name, resumeURL: block.url };
      }
    }

    // 3 — word overlap
    const roleWords = new Set(r.split(/\W+/).filter(Boolean));
    for (const name of resumeNames) {
      const block = resumes[name];
      if (!block || !Array.isArray(block.keywords)) continue;
      for (const k of block.keywords) {
        const kwWords = new Set(k.toLowerCase().split(/\W+/).filter(Boolean));
        let overlap = 0;
        for (const w of roleWords) if (kwWords.has(w)) overlap++;
        if (overlap >= 1)
          return { resumeName: name, resumeURL: block.url };
      }
    }

    return null;
  }


  // DOWNLOAD PDF → convert to File object
  async function fetchResumeAsFile(url, filename) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || 'application/pdf' });
    } catch (err) {
      console.error("[AutoApply] Error fetching resume:", err);
      return null;
    }
  }


  // Insert file object into <input type="file">
  async function uploadFileToInput(el, fileObj) {
    if (!el || !fileObj) return false;

    const dt = new DataTransfer();
    dt.items.add(fileObj);
    el.files = dt.files;

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }



  function addResumePreviewButton(inputEl, blobUrl) {
    // Remove old preview button if it exists
    if (inputEl._resumePreviewButton) {
        inputEl._resumePreviewButton.remove();
    }

    const btn = document.createElement("button");
    btn.innerText = "Preview Attached Resume";
    btn.style.marginTop = "8px";
    btn.style.marginLeft = "4px";
    btn.style.padding = "6px 12px";
    btn.style.background = "#007bff";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "13px";
    btn.style.zIndex = "999999";

    btn.onclick = () => {
        window.open(blobUrl, "_blank");
    };

    inputEl.insertAdjacentElement("afterend", btn);

    // store reference so we can remove later if needed
    inputEl._resumePreviewButton = btn;
  }


  async function handleResumeField(inputEl, kb) {
    if (!inputEl) return false;

    // 1 — Retrieve remembered role
    const role = await getLastSelectedRole();
    if (!role) {
        alert("Role not found. Please fill skills section first, so role can be determined.");
        return false;
    }

    // 2 — Pick correct resume for that role
    const picked = pickResumeForRole(role, kb);
    if (!picked) {
        alert(`No resume found matching role "${role}".`);
        return false;
    }

    console.log("[AutoApply] Selected Resume:", picked);

    // 3 — Download resume file
    const fileObj = await fetchResumeAsFile(picked.resumeURL, picked.resumeName);
    if (!fileObj) {
        alert("Could not fetch resume from backend.");
        return false;
    }

    // 4 — Upload into file input
    await uploadFileToInput(inputEl, fileObj);

    // 5 — Create Blob URL for preview
    const blobUrl = URL.createObjectURL(fileObj);

    // 6 — Attach the preview button
    addResumePreviewButton(inputEl, blobUrl);

    console.log(`[AutoApply] Resume ${picked.resumeName} uploaded + preview added.`);
    return true;
  }









  async function runAutofill(kb) {
    console.log("[AutoApply] Starting autofill...");

    const fields = findFormFields();
    console.log('[AutoApply] fields found:', fields.length);

    for (const el of fields) {
        if (el.dataset.autoapplyProcessed === "1") {
          continue; // already filled
        }
        el.dataset.autoapplyProcessed = "1";
        const rawLabel = extractLabel(el);
        const labelText = normalizeLabel(rawLabel);

        // Scroll + highlight
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
        highlight(el);

        // 1️⃣ INTERNSHIP HANDLING FIRST
        if (labelText.includes("intern")) {
            const ok = await fillInternshipField(labelText, el, kb.internships);
            if (ok) continue;
        }

        // 2️⃣ NORMAL DIRECT MATCH HANDLER
        const directVal = handleFormInput(labelText, kb);
        if (directVal !== "Field not found") {
            await fillInput(el, directVal);
            continue;
        }
        // detect skills field
        if (labelText.includes('skill') || labelText.includes('skills') || labelText.includes('key skills') || labelText.includes('technical skills') || labelText.includes('skills to enter')) {
            const ok = await handleSkillsField(el, kb);
            if (ok) {
                // once skills are handled, skip further processing for this input
                continue;
            }
        }

        // Detect resume upload field
        if (
          labelText.includes("resume") ||
          labelText.includes("cv") ||
          labelText.includes("upload") ||
          labelText.includes("attachment")
        ) {
            const ok = await handleResumeField(el, kb);
            if (ok) continue; // Skip to next field
        }


        // 3️⃣ SEMANTIC MATCHING
        const match = await findMatchingKey(labelText, kb);
        console.log('[AutoApply] match result:', match);

        if (match) {
            let value = match.value;

            // Course/degree normalization
            // if (labelText.includes("course") || labelText.includes("degree")) {
            //     value = normalizeCourseText(value);
            // }

            if (labelText.includes("course")) {
                value = normalizeCourseText(value);
            }

            await fillInput(el, value);
            console.log(`✅ Filled ${match.key} → ${value}`);
            continue;
        }

        // 4️⃣ USER PROMPT FALLBACK
        const userVal = prompt(`AutoApply couldn't recognize "${labelText}". Enter value or leave blank to skip.`);

        if (userVal && userVal.trim() !== "") {
            await fillInput(el, userVal);

            const canonicalKey = prompt(
                `What does "${labelText}" represent?\n(e.g. first_name, last_name, city, dob, course, postal_code, etc.)`
            );

            if (canonicalKey && canonicalKey.trim() !== "") {
                kb[canonicalKey.trim().toLowerCase()] = userVal;
                await saveKbKey(canonicalKey.trim().toLowerCase(), userVal);
                console.log("[AutoApply] Saved new KB key:", canonicalKey);
            }
        }

        await new Promise(res => setTimeout(res, 200));
    }

    console.log('[AutoApply] Autofill complete.');
  }


  // ---------------- Loading and Running ----------------
  chrome.storage.local.get("knowledgeBase", (result) => {
      // result looks like: { knowledgeBase: { father_name: "...", ... } }
      const kb = result.knowledgeBase || {};  // <-- grab the actual KB object
      const flatKB = flattenObject(kb); 
      console.log("[AutoApply] Loaded KB:", kb);

      // Now pass kb to your test / autofill functions
      // testSemanticLookup(kb);
      runAutofill(kb);
  });


  // ---------------- UI helpers ----------------
  function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'rgba(40, 167, 69, 0.95)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '999999';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  // ---------------- Listener ----------------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'START_AUTOFILL') {
      (async () => {
        const kb = await readKnowledgeBase();
        const flatKB = flattenObject(kb); 
        await runAutofill(kb);
        sendResponse({ status: 'done' });
      })();
      return true;
    }
    return false;
  });

  (async () => {
    const kb = await readKnowledgeBase();
    console.log("📘 Loaded Knowledge Base:", kb);
    await runAutofill(kb);
  })();

})();




