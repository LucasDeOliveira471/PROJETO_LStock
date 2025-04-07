let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let notas = [];

function salvarProdutos() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function gerarCodigoBarras(nome) {
  return 'COD' + btoa(nome).substring(0, 8);
}

function adicionarProduto() {
  const nome = document.getElementById('nome').value;
  const preco = parseFloat(document.getElementById('preco').value);
  const estoque = parseInt(document.getElementById('estoque').value);
  const descricao = document.getElementById('descricao').value;

  if (!nome || isNaN(preco) || isNaN(estoque)) return alert('Preencha todos os campos.');

  const produto = { nome, preco, estoque, descricao, codigo: gerarCodigoBarras(nome) };
  produtos.push(produto);
  salvarProdutos();
  atualizarInterface();
}

function excluirProduto(index) {
  produtos.splice(index, 1);
  salvarProdutos();
  atualizarInterface();
}

function atualizarInterface() {
  const lista = document.getElementById('listaProdutos');
  const select = document.getElementById('produtoVenda');
  lista.innerHTML = '';
  select.innerHTML = '';

  produtos.forEach((p, i) => {
    lista.innerHTML += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${p.nome}</h5>
          <p class="card-text">
            Preço: R$${p.preco.toFixed(2)}<br>
            Estoque: ${p.estoque}<br>
            Descrição: ${p.descricao}<br>
            <div>
              <svg class="codigo-barras"></svg>
              <small>${p.codigo}</small>
            </div>
          </p>
          <button class="btn btn-danger" onclick="excluirProduto(${i})">Excluir</button>
        </div>
      </div>
    `;
    select.innerHTML += `<option value="${i}">${p.nome}</option>`;
  });

  setTimeout(() => {
    document.querySelectorAll('.codigo-barras').forEach((el, i) => {
      JsBarcode(el, produtos[i].codigo, { format: "CODE128", width: 2, height: 40 });
    });
  }, 100);
}

function realizarVenda() {
  const index = parseInt(document.getElementById('produtoVenda').value);
  const quantidade = parseInt(document.getElementById('quantidadeVenda').value);
  const produto = produtos[index];

  if (isNaN(quantidade) || quantidade <= 0 || quantidade > produto.estoque) {
    return alert('Quantidade inválida.');
  }

  produto.estoque -= quantidade;
  const total = quantidade * produto.preco;
  const data = new Date().toLocaleString();
  const nota = `(${data}) Venda de ${quantidade}x ${produto.nome} - Total: R$${total.toFixed(2)}`;
  notas.push(nota);

  salvarProdutos();
  atualizarInterface();
  atualizarNotas();
}

function atualizarNotas() {
  const divNotas = document.getElementById('notas');
  divNotas.innerHTML = notas.map(n => `<div class="alert alert-secondary">${n}</div>`).join('');
}

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Notas Fiscais", 10, 10);

  let y = 20;
  notas.forEach((nota, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${nota}`, 10, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("notas_fiscais.pdf");
}

atualizarInterface();
