let currentLang = "en";

const toggleBtn = document.getElementById("lang-toggle");

toggleBtn.addEventListener("click", () => {

    currentLang = currentLang === "en" ? "zh" : "en";

    document.querySelectorAll("[data-en]").forEach(element => {

        element.innerHTML =
            currentLang === "en"
            ? element.dataset.en
            : element.dataset.zh;

    });

    toggleBtn.innerText =
        currentLang === "en"
        ? "中文"
        : "English";

});
