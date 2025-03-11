# chatbot_api.py
import textwrap
from flask import Flask, request, jsonify
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
import sqlite3
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Initialize the language model with Gemini API
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key= os.getenv("GOOGLE_GEMENI_API_KEY")
)

# Database setup
def setup_database():
    conn = sqlite3.connect("chatbot_memory.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_summary_memory (
            user_id TEXT PRIMARY KEY,
            summary TEXT
        )
    """)
    conn.commit()
    conn.close()

setup_database()

# Function to fetch summary from the database
def fetch_user_summary(user_id):
    conn = sqlite3.connect("chatbot_memory.db")
    cursor = conn.cursor()
    cursor.execute("SELECT summary FROM user_summary_memory WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else ""

# Function to save summary to the database
def save_user_summary(user_id, current_summary):
    previous_summary = fetch_user_summary(user_id)
    combined_summary = f"{previous_summary}\n\n{current_summary}" if previous_summary else current_summary
    conn = sqlite3.connect("chatbot_memory.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_summary_memory (user_id, summary) VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET summary = excluded.summary
    """, (user_id, combined_summary))
    conn.commit()
    conn.close()

# Define prompt template
prompt_template = PromptTemplate(
    input_variables=["combined_context", "user_input"],
    template="""

    You are DineBot, a restaurant and food assistant chatbot. Your primary role is to provide accurate, concise, and user-friendly responses about restaurant recommendations, dish suggestions, recipes, and nutrition information. 

### Guidelines:
1. **Restaurant Recommendations:**
   - Provide a recommendation immediately,Located in Lahore Pakistan. Dont ask for additional details even if the user input is too vague (e.g., "recommend a restaurant"). 
   - Limit follow-up questions to one clarifying question.

2. **Food Suggestions vs. Recipes:**
   - If the user asks for a dish suggestion (e.g., "What should I eat today?"), recommend a dish and explain why it’s popular.
   - If the user asks for a recipe (e.g., "How do I make pasta?"), provide a simple step-by-step recipe in brief, with key ingredients and cooking steps. Keep recipes concise and suitable for a mobile screen.

3. **Nutrition Information:**
   - Provide a brief breakdown of calories, proteins, fats, and carbs. Include relevant dietary tags like vegan, gluten-free, etc.

4. **General Rules:**
   - Keep responses concise but flexible. Recipes and detailed recommendations can be longer than 3-4 lines if necessary.
   - Avoid repeating previous responses or asking too many questions.
   - Do not greet repeatedly. Only greet the user at the start of the conversation.
   - if some user ends the chat for example saying 'ok', end the conversation politely saying goodbye and offering any further assistance. 

5. **Unrelated Queries:**
   - Politely steer unrelated queries back to food-related topics.

Combined Context:
{combined_context}

User Input:
{user_input}

Response:"""
)

# Create chatbot chain
def create_chain(user_id):
    buffer_memory = ConversationBufferMemory(return_messages=True)
    summary_memory = ConversationSummaryMemory(llm=llm)
    chain = LLMChain(llm=llm, prompt=prompt_template)

    previous_summary = fetch_user_summary(user_id)
    if previous_summary:
        summary_memory.chat_memory.add_user_message(previous_summary)

    return buffer_memory, summary_memory, chain

# API endpoint for the chatbot
@app.route("/chat", methods=["POST"])
def chat():
    user_id = request.json.get("user_id")
    user_input = request.json.get("user_input")

    buffer_memory, summary_memory, chain = create_chain(user_id)

    # Combine chat history and generate response
    combined_context = fetch_user_summary(user_id)
    response = chain.run({
        "combined_context": combined_context,
        "user_input": user_input
    })

    # Save the updated summary
    summary_memory.save_context(
        inputs={"user_input": user_input},
        outputs={"response": response}
    )
    save_user_summary(user_id, summary_memory.load_memory_variables({}).get("history", ""))

    return jsonify({"response": response})

# Run the Flask app
if __name__ == "__main__":
    app.run(port=5000, debug=True)
