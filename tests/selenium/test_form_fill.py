"""
Selenium test to open the sample_form.html locally (file://) to manually observe extension behavior.
This script is optional and used to automate demo page launching.
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os

def open_demo():
    chrome_options = Options()
    chrome_options.add_argument("--disable-infobars")
    # Note: To test extension automatically you'd load the unpacked extension here.
    # For local demo, we simply open the demo page.
    driver = webdriver.Chrome(options=chrome_options)
    demo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'demo_pages', 'sample_form.html'))
    driver.get("file://" + demo_path)
    time.sleep(120)  # keep window open to manually test the extension
    driver.quit()

if __name__ == "__main__":
    open_demo()
