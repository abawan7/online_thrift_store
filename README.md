# Online Thrift Store

[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![React Native Maps](https://img.shields.io/badge/React_Native_Maps-1E90FF?style=flat&logo=react&logoColor=white)](https://github.com/react-native-maps/react-native-maps)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![LangChain](https://img.shields.io/badge/🦜_LangChain-2C2C2C?style=flat)](https://langchain.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-003B57?style=flat&logo=lock&logoColor=white)](https://www.npmjs.com/package/bcrypt)
[![AsyncStorage](https://img.shields.io/badge/AsyncStorage-3178C6?style=flat&logo=react-native&logoColor=white)](https://react-native-async-storage.github.io/async-storage/)



A mobile-first Final Year Project that brings second-hand shopping to your fingertips with real-time, location-based alerts and a trust-enhanced peer-to-peer marketplace.

## Demo
<img src="" width="350" />

## 🌟 Features

### Core Features
- User authentication (signup/login)
- Product listings management
- Real-time chat between buyers and sellers
- Wishlist functionality
- Location-based services
- AI-powered shopping assistant

### Chatbot Assistant
- Intelligent product recommendations
- Context-aware conversations using LangChain
- Persistent conversation memory
- Natural language processing capabilities

## 🏗️ Architecture

The project consists of two main components:

### Frontend (React Native/Expo)
- Modern and responsive UI
- Real-time messaging interface
- AsyncStorage for local data persistence
- Location services integration
- Image handling and display

### Backend Services
1. **FastAPI Backend (Chatbot Service)**
   - AI-powered chatbot implementation
   - LangChain integration
   - Conversation memory management
   - SQLite database for chat history

2. **Express.js Backend (Main Service)**
   - User authentication and management
   - Product listings
   - Real-time messaging (Socket.io)
   - Wishlist management
   - PostgreSQL database

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.9 or higher
- PostgreSQL database
- Expo CLI
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abawan7/online_thrift_store.git
   cd online_thrift_store
   ```

2. **Setup Main Backend (Express.js)**
   ```bash
   cd backend
   npm install
   # Create .env file with necessary configurations
   npm run dev
   ```

3. **Setup Chatbot Backend (FastAPI)**
   ```bash
   cd Chatbot/FYP-APP-BACKEND
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Update API_URL in app.config.js with your local IP
   npx expo start
   ```

### Environment Variables

Create `.env` files in both backend directories with the following configurations:

```env
# Express Backend
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_postgresql_url

# FastAPI Backend
OPENAI_API_KEY=your_openai_api_key
```

## 📱 Mobile App Features

### User Features
- User registration and authentication
- Profile management
- Location-based services
- Wishlist management
- Real-time chat with sellers

### Listing Features
- Create and manage product listings
- Upload multiple images
- Add product descriptions and tags
- Set prices and locations
- Edit and update listings

### Chat Features
- Real-time messaging
- AI chatbot assistance
- Message history
- Conversation persistence

## 💻 API Endpoints

### Main Backend (Express)
- `/api/auth`: Authentication endpoints
- `/api/listings`: Product listing management
- `/api/conversations`: Chat functionality
- `/api/wishlist`: Wishlist management

### Chatbot Backend (FastAPI)
- `/chat`: AI chatbot endpoint
- Conversation memory management
- Context-aware responses

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Secure file uploads

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Authors

- Abdullah Awan
- Ifra Ejaz
