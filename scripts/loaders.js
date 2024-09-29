async function loadHeader() {
    const response = await fetch('components/header.html');
    const headerHTML = await response.text();
    document.getElementById('header-container').innerHTML = headerHTML;
}