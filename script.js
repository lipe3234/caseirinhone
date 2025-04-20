// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgPvmrfclA8XTGtTsSCeDE390wVK46V9E",
  authDomain: "caseirinhosne.firebaseapp.com",
  projectId: "caseirinhosne",
  storageBucket: "caseirinhosne.firebasestorage.app",
  messagingSenderId: "446497107875",
  appId: "1:446497107875:web:d0c57713931048a96eb416",
  measurementId: "G-JDZMDE7K1E",
  databaseURL: "https://caseirinhosne-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      // Salvar os dados do usuário no Firebase
      await set(ref(db, `usuarios/${userId}`), {
        nome,
        email,
        endereco
      });

      alert("Cadastro realizado com sucesso!");
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    }
  });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      const userSnapshot = await get(ref(db, `usuarios/${userId}`));
      const userData = userSnapshot.val();

      // Salvar as informações do usuário no localStorage
      localStorage.setItem("usuario", JSON.stringify({ id: userId, ...userData }));
      alert("Login realizado!");
      window.location.href = "catalogo.html";
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  });
}

// Produtos no catálogo
const produtosContainer = document.getElementById("produtos");
if (produtosContainer) {
  get(ref(db, "produtos")).then((snapshot) => {
    const produtos = snapshot.val();
    if (produtos) {
      Object.values(produtos).forEach((produto) => {
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
    }
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
    carrinhoContainer.innerHTML = "<p>O carrinho está vazio.</p>";
  } else {
    carrinho.forEach((item) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${item.nome}</strong> - R$ ${item.preco.toFixed(2)}`;
      carrinhoContainer.appendChild(div);
    });

    finalizarBtn.addEventListener("click", () => {
      if (usuarioLogado) {
        const pedidoRef = push(ref(db, "pedidos"));
        set(pedidoRef, {
          usuarioId: usuarioLogado.id,
          carrinho,
          data: new Date().toISOString()
        });
        alert("Pedido finalizado!");
        localStorage.removeItem("carrinho");
        window.location.href = "pagamento.html";
      } else {
        alert("Faça login antes de finalizar o pedido.");
        window.location.href = "login.html";
      }
    });
  }
}
