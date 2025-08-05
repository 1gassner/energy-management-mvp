# 🎯 Railway UI Guide - Root Directory finden

## 📍 **Root Directory Setting finden:**

### **Option 1: Service Settings**
1. **Railway Dashboard** → **Dein Service anklicken**
2. **Settings** Tab (Zahnrad Icon oben rechts)
3. Scrolle nach unten zu **"Source"** oder **"Deploy"** Section
4. Suche nach **"Root Directory"**, **"Working Directory"** oder **"Build Path"**

### **Option 2: Deploy Settings** 
1. **Railway Dashboard** → **Service**
2. **Deployments** Tab
3. **"Deploy Settings"** oder **"Configure"** Button
4. **"Advanced Settings"** aufklappen
5. **"Root Directory"** oder **"Source Directory"**

### **Option 3: Service Overview**
1. **Service** anklicken
2. **"Configure"** oder **"Edit"** Button (meist oben rechts)
3. **"Source Settings"** oder **"Repository Settings"**
4. **"Root Directory"** Feld

## 🔧 **Alternative Lösung - Custom Commands:**

Falls du Root Directory nicht findest, nutze **Custom Build/Start Commands**:

### **In Railway Settings:**
1. **Build Command**: `cd backend && npm ci --only=production`
2. **Start Command**: `cd backend && npm start`
3. **Install Command**: `cd backend && npm install`

### **Wo finde ich Build/Start Commands:**
- **Settings** Tab → **"Build"** Section
- Oder **Deployments** → **"Deploy Configuration"**
- Oder **Service** → **"Commands"** Section

## 🎯 **Schnellste Lösung - Neuen Service erstellen:**

Falls du die Settings nicht findest:

### **1. Neuen Service erstellen:**
```
Railway Dashboard → "New Service" → "Deploy from GitHub repo"
→ Repository: "1gassner/energy-management-mvp"  
→ Bei Setup: "Root Directory" = backend
→ Deploy
```

### **2. Alten Service löschen:**
Nach erfolgreichem neuen Service den broken Service löschen.

## 📱 **Railway UI hat sich geändert - Hier suchen:**

### **Moderne Railway UI:**
- **Service** → **Settings** → **"Source"**
- **Service** → **Settings** → **"Build Configuration"**  
- **Service** → **Settings** → **"Deploy Configuration"**

### **Legacy Railway UI:**
- **Service** → **"Configure"** → **"Root Directory"**
- **Service** → **"Settings"** → **"General"**

## 🚨 **Wenn gar nichts funktioniert:**

### **Plan B - Dockerfile nutzen:**
Railway nutzt automatisch den **Dockerfile** den ich erstellt habe, wenn es package.json nicht findet.

**Der Dockerfile ist bereits im Repository und sollte funktionieren!**

## 🎯 **Was genau suchst du:**

Suche nach einem **Textfeld** wo du **"backend"** eingeben kannst:

- **"Root Directory"**
- **"Working Directory"**  
- **"Source Directory"**
- **"Build Path"**
- **"Project Path"**

**Oder suche nach Build Commands wo du eingeben kannst:**
- **Build Command**: `cd backend && npm ci --only=production`
- **Start Command**: `cd backend && npm start`

---

**Railway UI ändert sich oft - sag mir was du siehst und ich helfe dir weiter! 🚀**