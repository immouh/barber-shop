import { useEffect, useMemo, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth, db } from "../lib/firebase"
import "./Admin.css"

const defaultFormState = {
  date: "",
  time: "",
  name: "",
  phone: "",
  service: "",
  barber: "",
}

function Admin() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState("")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  })
  const [appointments, setAppointments] = useState([])
  const [formData, setFormData] = useState(() => ({
    ...defaultFormState,
    date: new Date().toISOString().slice(0, 10),
  }))
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const barberName = useMemo(() => {
    if (!user?.email) return ""
    const email = user.email.toLowerCase()
    if (email === "alahelli50@gmail.com") return "ALAA"
    if (email.includes("alaa")) return "ALAA"
    if (email.includes("nadji")) return "NADJI"
    return ""
  }, [user])

  useEffect(() => {
    if (!user) return
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("date", "==", selectedDate),
      where("barber", "==", barberName),
      orderBy("time")
    )
    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAppointments(results)
      },
      (error) => {
        setFormError(error.message || "Erreur de chargement.")
      }
    )
    return () => unsubscribe()
  }, [selectedDate, user])

  useEffect(() => {
    setFormData((prev) => ({ ...prev, date: selectedDate, barber: barberName }))
  }, [selectedDate, barberName])

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthError("")
    try {
      await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      )
    } catch (error) {
      setAuthError("Identifiants invalides.")
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError("")
    setFormSuccess("")

    if (!barberName) {
      setFormError("Aucun coiffeur associe a ce compte.")
      return
    }

    if (!formData.date || !formData.time) {
      setFormError("Date et heure obligatoires.")
      return
    }

    try {
      const conflictQuery = query(
        collection(db, "appointments"),
        where("date", "==", formData.date),
        where("time", "==", formData.time),
        where("barber", "==", barberName)
      )
      const conflictSnapshot = await getDocs(conflictQuery)
      if (!conflictSnapshot.empty) {
        setFormError("Creneau deja reserve.")
        return
      }

      await addDoc(collection(db, "appointments"), {
        ...formData,
        barber: barberName,
        createdAt: serverTimestamp(),
      })
      setFormSuccess("Rdv ajoute.")
      setFormData((prev) => ({
        ...defaultFormState,
        date: prev.date,
        barber: barberName,
      }))
    } catch (error) {
      setFormError("Erreur lors de l'ajout.")
    }
  }

  const handleDelete = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId))
    } catch (error) {
      setFormError("Erreur lors de l'annulation.")
    }
  }

  if (authLoading) {
    return (
      <div className="admin-page">
        <p className="admin-loading">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1>Connexion coiffeur</h1>
          <p>Connectez-vous pour voir les rendez-vous.</p>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(event) =>
                  setLoginData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(event) =>
                  setLoginData((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
              />
            </label>
            {authError ? <p className="admin-error">{authError}</p> : null}
            <button className="admin-btn" type="submit">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Espace coiffeur</p>
          <h1>Rendez-vous</h1>
        </div>
        <div className="admin-actions">
          <p className="admin-user">{user.email}</p>
          <button className="admin-btn ghost" onClick={handleLogout}>
            Deconnexion
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <div className="admin-card">
          <h2>Nouveau rendez-vous</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Date
              <input
                type="date"
                value={formData.date}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Heure
              <input
                type="time"
                value={formData.time}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    time: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Nom client
              <input
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Telephone
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Prestation
              <input
                type="text"
                value={formData.service}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    service: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Coiffeur
              <input type="text" value={barberName || "-"} readOnly />
            </label>
            {formError ? <p className="admin-error">{formError}</p> : null}
            {formSuccess ? (
              <p className="admin-success">{formSuccess}</p>
            ) : null}
            <button className="admin-btn" type="submit">
              Ajouter le rdv
            </button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Rendez-vous du jour</h2>
            <input
              className="admin-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          {appointments.length === 0 ? (
            <p className="admin-empty">Aucun rendez-vous.</p>
          ) : (
            <div className="admin-list">
              <h3>{barberName}</h3>
              <ul>
                {appointments.map((item) => (
                  <li key={item.id}>
                    <span>{item.time}</span>
                    <div>
                      <p>{item.name}</p>
                      <p className="muted">
                        {item.service} • {item.phone}
                      </p>
                    </div>
                    <button
                      className="admin-btn ghost small"
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Annuler
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Admin
