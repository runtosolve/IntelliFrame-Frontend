export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 text-sm text-center py-4">
      <p>Copyright © {currentYear} - All right reserved by RunToSolve, LLC</p>
    </footer>
  );
}
