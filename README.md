# 🤖 ChhavaBot: RAG WhatsApp Chatbot

ChhavaBot is an AI-powered WhatsApp chatbot built to automate car service bookings, test drives, and emergency assistance. Utilizing Retrieval-Augmented Generation (RAG), it delivers context-aware and real-time responses for a seamless customer experience.

---

## 📚 Table of Contents
- Project Overview
- Features
- Tech Stack
- Architecture Overview
- WhatsApp & Baileys.js Setup
- Running ChhavaBot Locally
- Screenshots
- License

---

## 📌 Project Overview

ChhavaBot simplifies the interaction between users and automotive service providers through an intelligent WhatsApp interface. The chatbot offers responsive, smart, and secure communication using the RAG pipeline powered by Groq.

---

## 👥 User Roles

- **Customer**: Interacts via WhatsApp to request services, book test drives, or seek help.
- **Admin/Operator** *(optional)*: Can view service logs or intervene when necessary (future roadmap feature).

---

## 🧠 Core Functionalities

- **Real-Time Conversations**: Handles incoming WhatsApp messages using Baileys.js.
- **RAG-based Responses**: Fetches relevant context and uses a language model for precise and conversational replies.
- **Car Service Booking**: Users can schedule maintenance and general services.
- **Test Drive Scheduling**: Book a test drive directly from WhatsApp with confirmation messages.
- **Emergency Assistance**: Instantly triggers help for breakdowns or urgent support.
- **Session Context**: Keeps short-term memory to maintain context during chats.

---

## 🧰 Tech Stack

- **Flask** – Backend framework for routing, processing, and response handling.
- **Baileys.js** – WhatsApp Web API wrapper for Node.js to send and receive messages.
- **Groq** – High-speed inference engine for powering RAG and LLM responses.
- **SQLite/MySQL** – (Optional) For logging conversations and booking history.

---

## 🏗️ Architecture Overview

```txt
[WhatsApp User] <--> [Baileys.js] <--> [Flask API] <--> [RAG Engine (Groq)] <--> [Response]
                                              |
                                              +--> [Database (Bookings, Logs)]
