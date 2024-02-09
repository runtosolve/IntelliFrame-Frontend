export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer footer-center bg-neutral text-neutral-content py-4">
        <aside>
          <p>Copyright © {currentYear} - All right reserved by RunToSolve, LLC</p>
        </aside>
      </footer>
    </>
  );
}