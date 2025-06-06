let temas = [];

async function carregarTemas() {
  const res = await fetch("temas.json");
  temas = await res.json();
}

// LOGIN DO CATEQUIZANDO
async function fazerLogin() {
  await carregarTemas();

  const data = document.getElementById("dataEncontro").value;
  const nome = document.getElementById("nome").value.trim();
  const tema = document.getElementById("tema").value.toLowerCase().trim();
  const senha = document.getElementById("senha").value.trim().toLowerCase();
  const erro = document.getElementById("erro");

  const encontro = temas.find(t => t.data === data);

  if (encontro && senha === encontro.senha.toLowerCase()) {
    const presenca = { nome, data, tema: encontro.tema };
    let lista = JSON.parse(localStorage.getItem("presencas") || "[]");
    lista.push(presenca);
    localStorage.setItem("presencas", JSON.stringify(lista));
    localStorage.setItem("autenticado", "sim");
    location.href = "temas.html";
  } else {
    erro.textContent = "Dados incorretos.";
  }
}

// EXIBE OS TEMAS E LINKS DE PDF
async function exibirTemas() {
  if (localStorage.getItem("autenticado") !== "sim") {
    location.href = "index.html";
    return;
  }

  const res = await fetch("temas.json");
  const dados = await res.json();

  const container = document.getElementById("listaEncontros");
  dados.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${t.tema}</h3>
      <p><strong>Data:</strong> ${t.data}</p>
      <a href="pdfs/${t.pdf}" download>📄 Baixar PDF</a>
    `;
    container.appendChild(card);
  });
}

// EXIBE A LISTA DE PRESENÇAS (APENAS CATEQUISTA)
function exibirPresencas() {
  if (localStorage.getItem("nivel") !== "catequista") {
    alert("Acesso restrito.");
    location.href = "index.html";
    return;
  }

  const lista = JSON.parse(localStorage.getItem("presencas") || "[]");
  const tbody = document.querySelector("#tabelaPresencas tbody");

  lista.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${p.nome}</td><td>${p.data}</td><td>${p.tema}</td>`;
    tbody.appendChild(row);
  });
}

// EXPORTA PRESENÇAS PARA CSV
function exportarCSV() {
  const lista = JSON.parse(localStorage.getItem("presencas") || "[]");

  const csv = [
    ["Nome", "Data", "Tema"],
    ...lista.map(p => [p.nome, p.data, p.tema])
  ].map(e => e.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "presencas.csv";
  a.click();
}

// SAIR DO SISTEMA
function sair() {
  localStorage.clear();
  location.href = "index.html";
}

// DETECTAR QUAL PÁGINA ATIVA
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("listaEncontros")) exibirTemas();
  if (document.querySelector("#tabelaPresencas")) exibirPresencas();
});

