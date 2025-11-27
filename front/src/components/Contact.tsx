export default function Contact() {
  return (
    <section className="py-16 px-4 max-w-xl mx-auto">
      <h3 className="text-3xl font-bold text-center mb-8">Contactez-moi</h3>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Votre nom"
          className="p-3 rounded border dark:bg-gray-800"
          required
        />
        <input
          type="email"
          placeholder="Votre email"
          className="p-3 rounded border dark:bg-gray-800"
          required
        />
        <textarea
          placeholder="Votre message"
          className="p-3 rounded border h-32 dark:bg-gray-800"
          required
        ></textarea>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Envoyer
        </button>
      </form>
    </section>
  );
}
