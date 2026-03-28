const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
const submenuItems = document.querySelectorAll(".has-submenu");
const menuLinks = document.querySelectorAll(".menu-item > a");

const STORAGE_KEY = "sidebar-collapsed";

/* =========================
   RESTAURA ESTADO
========================= */
document.addEventListener("DOMContentLoaded", () => {
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === "true";

    if (isCollapsed && window.innerWidth >= 992) {
        sidebar.classList.add("collapsed");
    }
});

/* =========================
   TOGGLE BOTÃO
========================= */
toggleBtn.addEventListener("click", () => {

    if (window.innerWidth < 992) {
        sidebar.classList.toggle("mobile-open");
        return;
    }

    sidebar.classList.toggle("collapsed");

    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem(STORAGE_KEY, isCollapsed);
});

/* =========================
   AUTO EXPANDIR AO CLICAR
========================= */
menuLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        if (sidebar.classList.contains("collapsed") && window.innerWidth >= 992) {

            e.preventDefault(); // impede navegação

            sidebar.classList.remove("collapsed");
            localStorage.setItem(STORAGE_KEY, false);

            return;
        }

        /* Submenu comportamento normal */
        const parent = this.parentElement;

        if (parent.classList.contains("has-submenu")) {
            e.preventDefault();
            parent.classList.toggle("open");
        }

    });

});