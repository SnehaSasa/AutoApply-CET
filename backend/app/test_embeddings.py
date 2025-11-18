# test_embeddings.py

from app.embeddings import EmbeddingService

def main():
    # Initialize embedding service
    es = EmbeddingService()

    # Sample KB for testing
    kb = {
        "family_name": "A",
        "father_name": "Anguswamy J",
        "postal_code": "600021",
        "country": "India"
    }

    # Update KB
    es.update_knowledge_base(kb)

    # Test semantic search
    test_queries = ["last name", "surname", "dad name", "father name", "zip code", "pin code"]

    for query in test_queries:
        result = es.most_similar(query)
        print(f"Query: {query}")
        print(f"Most similar key(s): {result['results']}")
        print("-" * 40)

if __name__ == "__main__":
    main()
