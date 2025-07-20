// Definición de los nombres de los factores en español
export const factorNames: Record<string, string> = {
  "stranger-directed-aggression": "Agresión dirigida a extraños",
  "owner-directed-aggression": "Agresión dirigida al dueño",
  "dog-directed-aggression": "Agresión dirigida a perros",
  "dog-directed-fear": "Miedo dirigido a perros",
  "familiar-dog-aggression": "Agresión a perros familiares",
  trainability: "Capacidad de entrenamiento",
  chasing: "Persecución",
  "stranger-directed-fear": "Miedo dirigido a extraños",
  "nonsocial-fear": "Miedo no social",
  "separation-related-problems": "Problemas relacionados con la separación",
  "touch-sensitivity": "Sensibilidad al tacto",
  excitability: "Excitabilidad",
  "attachment-attention-seeking": "Apego/búsqueda de atención",
  energy: "Energía",
}

// Actualizar los valores de referencia (population average) con los datos proporcionados
export const populationAverages: Record<string, number> = {
  "stranger-directed-aggression": 0.59,
  "owner-directed-aggression": 0.19,
  "dog-directed-aggression": 0.97,
  "dog-directed-fear": 0.72,
  "familiar-dog-aggression": 0.62,
  trainability: 2.56,
  chasing: 2.09,
  "stranger-directed-fear": 0.63,
  "nonsocial-fear": 0.76,
  "separation-related-problems": 0.56,
  "touch-sensitivity": 0.68,
  excitability: 2.0,
  "attachment-attention-seeking": 1.91,
  energy: 1.95,
}

// Definición de las preguntas agrupadas por factor
interface Question {
  id: string
  text: string
}

export const cbarqQuestions: Record<string, Question[]> = {
  "stranger-directed-aggression": [
    { id: "q10", text: "Cuando un adulto desconocido se acerca directamente mientras pasea con correa." },
    { id: "q11", text: "Cuando un niño desconocido se acerca directamente mientras pasea con correa." },
    { id: "q12", text: "Hacia personas desconocidas que se acercan mientras está en su coche." },
    { id: "q15", text: "Cuando una persona desconocida se acerca a usted o a otro miembro de la familia en casa." },
    {
      id: "q16",
      text: "Cuando personas desconocidas se acercan a usted o a otro miembro de la familia fuera de casa.",
    },
    { id: "q18", text: "Cuando carteros u otros repartidores se acercan a su casa." },
    {
      id: "q20",
      text: "Cuando extraños pasan por delante de su casa mientras su perro está en el exterior o en el jardín.",
    },
    { id: "q21", text: "Cuando una persona desconocida intenta tocar o acariciar al perro." },
    { id: "q22", text: "Cuando corredores, ciclistas o patinadores pasan por delante de su casa." },
    { id: "q28", text: "Hacia personas desconocidas que visitan su casa." },
  ],
  "owner-directed-aggression": [
    { id: "q9", text: "Cuando es corregido o castigado verbalmente por usted o un miembro del hogar." },
    { id: "q13", text: "Cuando juguetes, huesos u otros objetos le son quitados por un miembro del hogar." },
    { id: "q14", text: "Cuando es bañado o cepillado por un miembro del hogar." },
    { id: "q17", text: "Cuando un miembro del hogar se acerca directamente mientras está comiendo." },
    { id: "q19", text: "Cuando su comida es retirada por un miembro del hogar." },
    { id: "q25", text: "Cuando un miembro del hogar lo mira directamente." },
    { id: "q30", text: "Cuando un miembro del hogar pasa por encima de él." },
    { id: "q31", text: "Cuando usted o un miembro del hogar recupera comida u objetos robados por el perro." },
  ],
  "dog-directed-aggression": [
    { id: "q23", text: "Cuando se acerca directamente un perro macho desconocido mientras pasea con correa." },
    { id: "q24", text: "Cuando se acerca directamente una perra desconocida mientras pasea con correa." },
    { id: "q26", text: "Hacia perros desconocidos que visitan su casa." },
    { id: "q29", text: "Cuando otro perro (desconocido) le ladra, gruñe o se abalanza." },
  ],
  "dog-directed-fear": [
    { id: "q45", text: "Cuando se acerca directamente un perro desconocido del mismo tamaño o mayor." },
    { id: "q46", text: "Cuando se acerca directamente un perro desconocido de menor tamaño." },
    { id: "q53", text: "Cuando un perro desconocido le ladra, gruñe o se abalanza." },
  ],
  "familiar-dog-aggression": [
    { id: "q32", text: "Hacia otro perro (familiar) de su hogar." },
    { id: "q33", text: "Cuando se acerca a su lugar favorito de descanso/sueño otro perro (familiar) del hogar." },
    { id: "q34", text: "Cuando se acerca mientras come otro perro (familiar) del hogar." },
    {
      id: "q35",
      text: "Cuando se acerca mientras juega/mastica un juguete, hueso u objeto favorito otro perro (familiar) del hogar.",
    },
  ],
  trainability: [
    { id: "q1", text: "Cuando está sin correa, regresa inmediatamente al ser llamado." },
    { id: "q2", text: "Obedece la orden de 'sentado' inmediatamente." },
    { id: "q3", text: "Obedece la orden de 'quieto' inmediatamente." },
    { id: "q4", text: "Parece atender/escuchar atentamente todo lo que usted dice o hace." },
    { id: "q5", text: "Es lento para responder a la corrección o castigo; 'duro de pelar'." },
    { id: "q6", text: "Es lento para aprender nuevos trucos o tareas." },
    { id: "q7", text: "Se distrae fácilmente con vistas, sonidos o olores interesantes." },
    { id: "q8", text: "Trae o intenta traer palos, pelotas u objetos." },
  ],
  chasing: [
    { id: "q74", text: "Persigue o perseguiría gatos si tuviera la oportunidad." },
    { id: "q75", text: "Persigue o perseguiría pájaros si tuviera la oportunidad." },
    {
      id: "q76",
      text: "Persigue o perseguiría ardillas, conejos y otros pequeños animales si tuviera la oportunidad.",
    },
  ],
  "stranger-directed-fear": [
    { id: "q36", text: "Cuando se acerca directamente un adulto desconocido mientras está fuera de casa." },
    { id: "q37", text: "Cuando se acerca directamente un niño desconocido mientras está fuera de casa." },
    { id: "q39", text: "Cuando personas desconocidas visitan su casa." },
    { id: "q40", text: "Cuando una persona desconocida intenta tocar o acariciar al perro." },
  ],
  "nonsocial-fear": [
    {
      id: "q38",
      text: "En respuesta a ruidos repentinos o fuertes (p.ej. aspiradora, tubo de escape, taladros, objetos que caen, etc.).",
    },
    { id: "q41", text: "En tráfico intenso." },
    {
      id: "q42",
      text: "En respuesta a objetos extraños o desconocidos en o cerca de la acera (p.ej. bolsas de basura, hojas, basura, banderas ondeando, etc.).",
    },
    { id: "q44", text: "Durante tormentas, exhibiciones de fuegos artificiales o eventos similares." },
    {
      id: "q47",
      text: "Cuando se expone por primera vez a situaciones desconocidas (p.ej. primer viaje en coche, primera vez en ascensor, primera visita al veterinario, etc.).",
    },
    { id: "q48", text: "En respuesta al viento o a objetos movidos por el viento." },
    { id: "q84", text: "Nervioso o asustado en las escaleras." },
  ],
  "separation-related-problems": [
    { id: "q54", text: "Tiembla, se estremece o tirita cuando se queda solo." },
    { id: "q55", text: "Salivación excesiva cuando se queda solo." },
    { id: "q56", text: "Inquietud, agitación o paseos cuando se queda solo." },
    { id: "q57", text: "Lloriquea cuando se queda solo." },
    { id: "q58", text: "Ladra cuando se queda solo." },
    { id: "q59", text: "Aúlla cuando se queda solo." },
    { id: "q60", text: "Mastica o araña puertas, suelo, ventanas, cortinas, etc. cuando se queda solo." },
    { id: "q61", text: "Pérdida de apetito cuando se queda solo." },
  ],
  "touch-sensitivity": [
    { id: "q43", text: "Cuando es examinado/tratado por un veterinario." },
    { id: "q49", text: "Cuando le cortan las uñas por un miembro del hogar." },
    { id: "q50", text: "Cuando es cepillado o bañado por un miembro del hogar." },
    { id: "q51", text: "Cuando le secan las patas con una toalla un miembro del hogar." },
  ],
  excitability: [
    { id: "q62", text: "Cuando usted u otros miembros del hogar regresan después de una breve ausencia." },
    { id: "q63", text: "Cuando juega con usted u otros miembros de su hogar." },
    { id: "q64", text: "Cuando suena el timbre." },
    { id: "q65", text: "Justo antes de ser sacado a pasear." },
    { id: "q66", text: "Justo antes de ser llevado en coche." },
    { id: "q67", text: "Cuando llegan visitas a su casa." },
  ],
  "attachment-attention-seeking": [
    { id: "q68", text: "Muestra un fuerte apego por un miembro particular del hogar." },
    {
      id: "q69",
      text: "Tiende a seguirle a usted (o a otros miembros del hogar) por la casa, de habitación en habitación.",
    },
    { id: "q70", text: "Tiende a sentarse cerca o en contacto con usted (o con otros) cuando está sentado." },
    {
      id: "q71",
      text: "Tiende a empujar, acariciar o dar golpecitos con la pata a usted (o a otros) para llamar la atención cuando está sentado.",
    },
    {
      id: "q72",
      text: "Se agita (lloriquea, salta, trata de intervenir) cuando usted (u otros) muestra afecto por otra persona.",
    },
    {
      id: "q73",
      text: "Se agita (lloriquea, salta, trata de intervenir) cuando usted (u otros) muestra afecto por otro perro o animal.",
    },
  ],
  energy: [
    { id: "q90", text: "Hiperactivo, inquieto, tiene problemas para calmarse." },
    { id: "q91", text: "Juguetón, cachorruno, bullicioso." },
    { id: "q92", text: "Activo, enérgico, siempre en movimiento." },
  ],
}

// Conductas especiales (preguntas que no corresponden a ningún factor)
export const specialBehaviors: Question[] = [
  { id: "q27", text: "Hacia gatos, ardillas u otros animales que entran en su jardín." },
  { id: "q52", text: "Cuando perros desconocidos visitan su casa." },
  { id: "q77", text: "Escapa o escaparía de casa o jardín si tuviera la oportunidad." },
  { id: "q78", text: "Se revuelca en excrementos de animales u otras sustancias 'malolientes'." },
  { id: "q79", text: "Come sus propios excrementos o heces de otros animales." },
  { id: "q80", text: "Mastica objetos inapropiados." },
  { id: "q81", text: "Se 'monta' en objetos, muebles o personas." },
  { id: "q82", text: "Mendiga persistentemente comida cuando la gente está comiendo." },
  { id: "q83", text: "Roba comida." },
  { id: "q85", text: "Tira excesivamente fuerte cuando va con correa." },
  { id: "q86", text: "Orina contra objetos/muebles en su casa." },
  { id: "q87", text: "Orina cuando es abordado, acariciado, manipulado o recogido." },
  { id: "q88", text: "Orina cuando se queda solo por la noche o durante el día." },
  { id: "q89", text: "Defeca cuando se queda solo por la noche o durante el día." },
  { id: "q93", text: "Mira fijamente a la nada visible." },
  { id: "q94", text: "Muerde al aire (moscas invisibles)." },
  { id: "q95", text: "Persigue su propia cola/trasero." },
  { id: "q96", text: "Persigue/sigue sombras, puntos de luz, etc." },
  { id: "q97", text: "Ladra persistentemente cuando está alarmado o excitado." },
  { id: "q98", text: "Se lame a sí mismo excesivamente." },
  { id: "q99", text: "Lame personas u objetos excesivamente." },
  { id: "q100", text: "Muestra otros comportamientos extraños, raros o repetitivos." },
]
