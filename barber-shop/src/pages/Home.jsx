import { Link } from "react-router-dom"
import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { db } from "../lib/firebase"
import "../App.css"
import logo from "../assets/logo.jpeg"
import salon1 from "../assets/salon-1.jpg"
import coupe1 from "../assets/coupe/coupe1.jpg"
import coupe2 from "../assets/coupe/coupe2.jpg"
import coupe3 from "../assets/coupe/coupe3.jpg"
import coupe4 from "../assets/coupe/coupe4.jpg"
import coupe5 from "../assets/coupe/coupe5.jpg"
import coupe6 from "../assets/coupe/coupe6.jpg"
import coupe7 from "../assets/coupe/coupe7.jpg"

const services = [
  {
    title: "Coupe signature",
    description: "Finition precise, lignes nettes, style sur-mesure.",
  },
  {
    title: "Barbe et details",
    description: "Contours propres, soin chaud, sensation clean.",
  },
  {
    title: "Coloration soft",
    description: "Nuances naturelles pour sublimer sans changer.",
  },
  {
    title: "Rituel premium",
    description: "Coupe + barbe + soins, un moment complet.",
  },
]

const prices = [
  { name: "Coupe de cheveux", value: "17€", detail: "30 min" },
  {
    name: "Coupe + Barbe + Shampoing",
    value: "22€",
    detail: "45 min",
  },
  { name: "Coupe Enfant (-12 ans)", value: "12€", detail: "30 min" },
  {
    name: "Barbe - Rasage a l'ancienne",
    value: "10€",
    detail: "20 min",
    note: "Serviette chaude",
  },
  { name: "Barbe - Traces & contours", value: "10€", detail: "20 min" },
  { name: "Defrisage", value: "10€", detail: "10 min" },
]

const team = [
  { name: "ALAA", role: "Coiffeur", focus: "Coupe precise" },
  { name: "NADJI", role: "Coiffeur", focus: "Nom a venir" },
]

const testimonials = [
  {
    quote:
      "5 etoiles. Le meilleur salon de coiffure de Bordeaux, personnel competent, agreable et jovial. Je recommande fortement.",
    name: "Bilel Cherki",
  },
  {
    quote:
      "5 etoiles. Ala, je n'ai jamais ete decu. Professionnalisme, ecoute et sens du detail. Accueil top, salon moderne et convivial. Je recommande les yeux fermes.",
    name: "Jean-Charles Bappel",
  },
  {
    quote:
      "5 etoiles. Tres bon coiffeur. Coupe super bien, finition propre, rapide et soignee. Je recommande a 100%.",
    name: "Aymen Boudraa",
  },
]

const coupes = [
  { src: coupe1, alt: "Coupe 1" },
  { src: coupe2, alt: "Coupe 2" },
  { src: coupe3, alt: "Coupe 3" },
  { src: coupe4, alt: "Coupe 4" },
  { src: coupe5, alt: "Coupe 5" },
  { src: coupe6, alt: "Coupe 6" },
  { src: coupe7, alt: "Coupe 7" },
]

const buildSlots = (startTime, endTime, stepMinutes) => {
  const slots = []
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)
  let current = new Date()
  current.setHours(startHour, startMinute, 0, 0)
  const end = new Date()
  end.setHours(endHour, endMinute, 0, 0)

  while (current <= end) {
    const hours = String(current.getHours()).padStart(2, "0")
    const minutes = String(current.getMinutes()).padStart(2, "0")
    slots.push(`${hours}:${minutes}`)
    current = new Date(current.getTime() + stepMinutes * 60 * 1000)
  }

  return slots
}

function Home() {
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "",
    name: "",
    phone: "",
    service: "",
    barber: "ALAA",
  })
  const [takenSlots, setTakenSlots] = useState([])
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState("")

  const timeSlots = useMemo(() => buildSlots("09:30", "19:30", 30), [])

  useEffect(() => {
    if (!bookingData.date || !bookingData.barber) return
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("date", "==", bookingData.date),
      where("barber", "==", bookingData.barber)
    )
    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const times = snapshot.docs
        .map((doc) => doc.data().time)
        .filter(Boolean)
      setTakenSlots(times)
    })
    return () => unsubscribe()
  }, [bookingData.date, bookingData.barber])

  const handleClientBooking = async (event) => {
    event.preventDefault()
    setBookingError("")
    setBookingSuccess("")

    if (!bookingData.date || !bookingData.time) {
      setBookingError("Veuillez choisir une date et un creneau.")
      return
    }

    if (takenSlots.includes(bookingData.time)) {
      setBookingError("Ce creneau est deja reserve.")
      return
    }

    try {
      await addDoc(collection(db, "appointments"), {
        ...bookingData,
        source: "client",
      })
      setBookingSuccess("Votre rendez-vous est enregistre.")
      setBookingData((prev) => ({
        ...prev,
        time: "",
        name: "",
        phone: "",
        service: "",
      }))
    } catch (error) {
      setBookingError("Erreur lors de la reservation.")
    }
  }

  return (
    <div className="page" style={{ "--page-bg": `url(${salon1})` }}>
      <header className="nav">
        <div className="brand">
          <img className="brand-logo" src={logo} alt="H & A Coiffeur" />
          <div>
            <p className="brand-name">H &amp; A</p>
            <p className="brand-subtitle">Coiffeur</p>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#accueil">Accueil</a>
          <a href="#services">Services</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#equipe">Equipe</a>
          <a href="#contact">Contact</a>
          <Link to="/admin">Espace pro</Link>
        </nav>
        <a className="btn small" href="#contact">
          Reserver
        </a>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-content reveal">
            <p className="eyebrow">Barber Shop urbain</p>
            <h1>
              Votre style, <span className="nowrap">notre savoir faire.</span>
            </h1>
            <p className="lede">
              Un studio ou chaque detail compte. Des barbiers a lecoute, une
              technique affutee, et une ambiance qui met a laise des la premiere
              minute.
            </p>
            <div className="hero-actions">
              <a
                className="btn primary"
                href="https://www.planity.com/ha-coiffure-33000-bordeaux/reservation"
                target="_blank"
                rel="noreferrer"
              >
                Prendre rendez-vous
              </a>
              <a className="btn ghost" href="#services">
                Voir les services
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <p className="meta-label">Horaires</p>
                <p className="meta-value">Tous les jours, 09:30 - 19:30</p>
              </div>
              <div>
                <p className="meta-label">Adresse</p>
                <p className="meta-value">
                  11bis Pl. Louis Barthou, 33000 Bordeaux
                </p>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card reveal">
              <p className="card-title">Note Google</p>
              <div className="card-stat">
                <span>5</span>
                <p>Etoiles</p>
              </div>
              <div className="card-stat">
                <span>11bis</span>
                <p>Pl. Louis Barthou</p>
              </div>
              <div className="card-stat">
                <span>Bordeaux</span>
                <p>33000</p>
              </div>
            </div>
          </div>
        </section>

        <section className="strip reveal">
          <p>Coupe rapide</p>
          <p>Barbe precise</p>
          <p>Soins premium</p>
          <p>Ambiance chill</p>
        </section>

        <section
          className="gallery"
          style={{ "--gallery-bg": `url(${salon1})` }}
        >
          <div className="section-head">
            <p className="eyebrow">Salon</p>
            <h2>Ambiance et espace</h2>
            <p className="section-copy">
              Un salon moderne, convivial, et pense pour votre confort.
            </p>
          </div>
        </section>

        <section className="cuts">
          <div className="section-head">
            <p className="eyebrow">Coupes</p>
            <h2>Nos styles en mouvement</h2>
            <p className="section-copy">
              Des coupes propres et nettes, faites pour durer.
            </p>
          </div>
          <div className="cuts-track">
            {[...coupes, ...coupes].map((item, index) => (
              <div className="cuts-card" key={`${item.alt}-${index}`}>
                <img src={item.src} alt={item.alt} />
              </div>
            ))}
          </div>
        </section>

        <section className="services" id="services">
          <div className="section-head">
            <p className="eyebrow">Services</p>
            <h2>Des gestes nets, un resultat durable</h2>
            <p className="section-copy">
              Chaque coupe est adaptee a ta morphologie et a ton style. On
              combine precision technique et sens du detail.
            </p>
          </div>
          <div className="grid cards">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="card-link">En savoir plus</span>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature">
            <h3>Consultation rapide</h3>
            <p>On valide la coupe, la barbe, et les details avant de demarrer.</p>
          </div>
          <div className="feature highlight">
            <h3>Produits pro</h3>
            <p>Soins haut de gamme pour une tenue naturelle et durable.</p>
          </div>
          <div className="feature">
            <h3>Hygiene stricte</h3>
            <p>Outils nettoyes et postes prepares entre chaque client.</p>
          </div>
        </section>

        <section className="pricing" id="tarifs">
          <div className="section-head">
            <p className="eyebrow">Tarifs Homme</p>
            <h2>Simple, clair, sans surprise</h2>
          </div>
          <div className="grid price-cards">
            {prices.map((price) => (
              <article className="price-card" key={price.name}>
                <p className="price-name">{price.name}</p>
                <p className="price-value">{price.value}</p>
                <p className="price-detail">{price.detail}</p>
                {price.note ? (
                  <p className="price-note">{price.note}</p>
                ) : null}
                <a
                  className="btn ghost"
                  href="https://www.planity.com/ha-coiffure-33000-bordeaux/reservation"
                  target="_blank"
                  rel="noreferrer"
                >
                  Choisir
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="team" id="equipe">
          <div className="section-head">
            <p className="eyebrow">Equipe</p>
            <h2>Les mains derriere le style</h2>
          </div>
          <div className="grid team-cards">
            {team.map((member) => (
              <article className="team-card" key={member.name}>
                <div className="team-avatar">{member.name[0]}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-focus">{member.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="testimonials">
          <div className="section-head">
            <p className="eyebrow">Avis clients - H&amp;A Coiffure</p>
            <h2>Ils parlent de nous</h2>
          </div>
          <div className="grid testimonial-cards">
            {testimonials.map((testimonial) => (
              <article className="testimonial" key={testimonial.name}>
                <p className="quote">"{testimonial.quote}"</p>
                <p className="author">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-card">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>Reserve ta place</h2>
              <p className="section-copy">
                Choisis ton horaire, donne ton numero, on te rappelle pour
                confirmer. Reponse rapide.
              </p>
              <div className="contact-info">
                <p>Tel: +213 555 123 456</p>
                <p>Email: bonjour@molavebarber.com</p>
                <p>11bis Pl. Louis Barthou, 33000 Bordeaux</p>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleClientBooking}>
              <label>
                Nom
                <input
                  type="text"
                  name="name"
                  placeholder="Ton nom"
                  required
                  value={bookingData.name}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Telephone
                <input
                  type="tel"
                  name="phone"
                  placeholder="+33..."
                  required
                  value={bookingData.phone}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Prestation
                <input
                  type="text"
                  name="service"
                  placeholder="Coupe, barbe, etc."
                  required
                  value={bookingData.service}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      service: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  required
                  value={bookingData.date}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      date: event.target.value,
                      time: "",
                    }))
                  }
                />
              </label>
              <label>
                Heure
                <select
                  name="time"
                  required
                  value={bookingData.time}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      time: event.target.value,
                    }))
                  }
                >
                  <option value="">Choisir un creneau</option>
                  {timeSlots.map((slot) => (
                    <option
                      key={slot}
                      value={slot}
                      disabled={takenSlots.includes(slot)}
                    >
                      {slot} {takenSlots.includes(slot) ? "(pris)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Coiffeur
                <select
                  name="barber"
                  value={bookingData.barber}
                  onChange={(event) =>
                    setBookingData((prev) => ({
                      ...prev,
                      barber: event.target.value,
                      time: "",
                    }))
                  }
                >
                  <option value="ALAA">ALAA</option>
                  <option value="NADJI">NADJI</option>
                </select>
              </label>
              {bookingError ? (
                <p className="contact-error">{bookingError}</p>
              ) : null}
              {bookingSuccess ? (
                <p className="contact-success">{bookingSuccess}</p>
              ) : null}
              <button type="submit" className="btn primary">
                Valider le rendez-vous
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>H&amp;A Coiffeur</p>
        <p>
          Suivre:{" "}
          <a
            href="https://www.instagram.com/ha_coiffure_/?igsh=MWN6bjViN2I2N3I5NA%3D%3D#"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </p>
      </footer>
    </div>
  )
}

export default Home
