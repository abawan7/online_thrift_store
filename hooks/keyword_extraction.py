import nltk
import sys
import json
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

# Ensure necessary downloads
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')

def extract_keywords(sentence):
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(sentence.lower())
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
    pos_tags = pos_tag(filtered_words)
    keywords = [word for word, tag in pos_tags if tag.startswith('NN') or tag.startswith('JJ') or tag == "CD"]
    return keywords

# Read input from Node.js
input_json = sys.stdin.read()
wishlist_items = json.loads(input_json)

# Process wishlist items
keywords_dict = {item: extract_keywords(item) for item in wishlist_items}

# Output JSON to Node.js
print(json.dumps(keywords_dict))
sys.stdout.flush()
