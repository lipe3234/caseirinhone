// URL base do backend
const API_URL = "http://localhost:3000";

// Verifica se está logado
let usuarioLogado = JSON.parse(localStorage.getItem("usuario")) || null;
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Cadastro
const cadastroForm = document.getElementById("cadastroForm");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("cadastroNome").value;
    const email = document.getElementById("cadastroEmail").value;
    const senha = document.getElementById("cadastroSenha").value;
    const endereco = document.getElementById("cadastroEndereco").value;

    const res = await fetch(`${API_URL}/usuarios/cadastrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, endereco }),
    });

    const data = await res.json();
    alert(data.message || "Cadastro realizado!");
  });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    const res = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Login realizado!");
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.location.href = "catalogo.html";
    } else {
      alert(data.message || "Erro ao fazer login");
    }
  });
}

// Produtos no catálogo
const produtosContainer = document.getElementById("produtos");
if (produtosContainer) {
  fetch(`${API_URL}/produtos`)
    .then((res) => res.json())
    .then((produtos) => {
      produtos.forEach((produto) => {
        const div = document.createElement("div");
        div.classList.add("produto");
        div.innerHTML = `
          <h3>${produto.nome}</h3>
          <img src="${produto.imagem}" alt="${produto.nome}" width="150"/>
          <p>${produto.descricao}</p>
          <strong>R$ ${produto.preco.toFixed(2)}</strong><br>
          <button onclick='adicionarAoCarrinho(${JSON.stringify(produto)})'>Adicionar ao carrinho</button>
        `;
        produtosContainer.appendChild(div);
      });
    });
}

// Adicionar ao carrinho
function adicionarAoCarrinho(produto) {
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert(`${produto.nome} adicionado ao carrinho!`);
}

// Mostrar carrinho
const carrinhoContainer = document.getElementById("carrinho");
const finalizarBtn = document.getElementById("finalizarPedido");

if (carrinhoContainer && finalizarBtn) {
  if (carrinho.length === 0) {
