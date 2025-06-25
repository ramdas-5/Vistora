# 🌟 Vistora – Discover & Share Visual Ideas

Vistora is a visually engaging **Pinterest-style full-stack web application** that allows users to explore, post, like, comment, and organize stunning images. Built with **Node.js**, **Express**, **MongoDB**, and **Tailwind CSS**, it provides a dynamic and responsive user experience with beautiful animations, modern UI, and powerful user features.

---

## 📌 Features

✅ **User Authentication**  
- Register, login, logout securely with Passport.js  
- Session management using express-session  

🖼️ **Post Management**  
- Upload, view, and manage visual posts  
- Like, comment, reply, and edit/delete your own comments  
- Comment threads with real-time interactions  

📍 **Pin & Board System**  
- Create named pins (boards) and assign posts to them  
- View boards in profile with associated posts  

👥 **User Profiles**  
- View other user profiles with username mentions  
- Each profile displays their pins, posts, and info  

🧭 **Navigation & Filtering**  
- Sort posts by "Newest First" or "Oldest First"  
- Explore feed or view content by pin/category  

🎨 **Beautiful UI**  
- Elegant landing page with hero section and animations  
- Animated and responsive login and registration forms  
- Mobile-friendly layout with dropdown menu  

---

## 🛠️ Tech Stack

| Layer         | Technology                        |
|---------------|------------------------------------|
| **Frontend**  | EJS, Tailwind CSS, HTML, JavaScript |
| **Backend**   | Node.js, Express.js                |
| **Database**  | MongoDB Atlas, Mongoose            |
| **Auth**      | Passport.js (Local Strategy)       |
| **Image Uploads** | Multer, Static File Serving   |

---

## 🧾 Project Structure

```
vistora/
│
├── public/               # Static assets (CSS, JS, uploads)
├── routes/
│   ├── index.js          # Main routes (feed, post, comments)
│   └── users.js          # User schema, login, registration logic
│
├── views/                # EJS templates
│   ├── partials/         # Header, footer, navbar
│   ├── landing.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   ├── postDetail.ejs
│   └── feed.ejs
│
├── images/               # Uploaded image directory
├── .env                  # Environment variables
├── app.js                # App and middleware setup
├── bin/www               # Server entry point
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vistora.git
cd vistora
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file at the root level and add your MongoDB URI and session secret:

```env
MONGO_URI= your_db
SESSION_SECRET=yourSessionSecret
```

### 4. Start the Server

```bash
npx nodemon
```

Your app should now run at:  
🔗 `http://localhost:3000`

---

## 📸 Screenshots

> Add screenshots of:
> - Landing page
> - Login/Register page
> - Feed with filters
> - Post detail with likes/comments
> - Profile with pins

---

## ✅ TODO (Future Enhancements)

- [ ] Save posts to favorites  
- [ ] Search functionality  
- [ ] Notification system for replies/likes  
- [ ] Explore trending pins and tags  

---

## 🧪 Demo Test User (Optional)

```txt
Username: testuser
Password: test123
```

---

## 👨‍💻 Author

**Ramdas Hembram**  
✉️ Email: [ramdashembram@example.com](mailto:ramdashembram@example.com)  
🌐 GitHub: [github.com/yourusername](https://github.com/yourusername)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Made with 💖 for learning and inspiration.
