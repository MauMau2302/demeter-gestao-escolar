// Lista de turmas da escola
const turmas = [
  "1ºA", "1ºB",
  "2ºA", "2ºB",
  "3ºA", "3ºB", "3ºC", "3ºD",
  "4ºA", "4ºB", "4ºC",
  "5ºA", "5ºB", "5ºC",
  "6ºA", "6ºB"
];

// Variável para guardar a turma que está sendo editada no momento
let turmaAtual = "";

// Elementos do DOM utilizados com frequência
const campoQtd = document.getElementById("qtd");
const campoObs = document.getElementById("obs");
const msgFeedback = document.getElementById("msg");
const msgMenuFeedback = document.getElementById("msgMenu");
const tabelaCorpo = document.getElementById("tbody");
const campoTotal = document.getElementById("total");
const cardapioArea = document.getElementById("cardapioArea");
const previewArea = document.getElementById("preview");
const inputArquivo = document.getElementById("arquivo");

// Função para trocar de tela
function abrir(telaId) {
  const todasTelas = document.querySelectorAll(".tela");
  todasTelas.forEach(tela => tela.classList.remove("ativa"));

  const telaAlvo = document.getElementById(telaId);
  if (telaAlvo) {
    telaAlvo.classList.add("ativa");
  }

  // Ações automáticas ao entrar em determinadas telas
  if (telaId === "cozinha") {
    atualizarTabela();
  }
  if (telaId === "cardapio") {
    verCardapio();
  }
  if (telaId === "gerenciar") {
    atualizarPreview();
  }

  window.scrollTo(0, 0);
}

// Busca os dados salvos das turmas no localStorage
function pegarDados() {
  const dadosSalvos = localStorage.getItem("demeter_dados");
  if (!dadosSalvos) {
    return {};
  }
  return JSON.parse(dadosSalvos);
}

// Cria os botões das turmas na tela de seleção
function criarBotoesTurmas() {
  const grade = document.getElementById("grade");
  grade.innerHTML = "";

  turmas.forEach(nomeTurma => {
    const botao = document.createElement("button");
    botao.innerText = nomeTurma;
    botao.onclick = () => selecionarTurma(nomeTurma);
    grade.appendChild(botao);
  });
}

// Carrega os dados da turma selecionada e vai para a tela de registro
function selecionarTurma(nomeTurma) {
  turmaAtual = nomeTurma;
  document.getElementById("tituloTurma").innerText = "Turma " + nomeTurma;

  const dados = pegarDados();

  if (dados[nomeTurma]) {
    campoQtd.value = dados[nomeTurma].quantidade;
    campoObs.value = dados[nomeTurma].observacao;
  } else {
    campoQtd.value = "";
    campoObs.value = "";
  }

  msgFeedback.innerText = "";
  abrir("registro");
}

// Salva as informações da turma no localStorage
function salvar() {
  if (campoQtd.value.trim() === "" || Number(campoQtd.value) < 0) {
    msgFeedback.innerText = "Por favor, informe uma quantidade válida de refeições.";
    msgFeedback.style.color = "#c0392b";
    return;
  }

  const dados = pegarDados();
  dados[turmaAtual] = {
    quantidade: Number(campoQtd.value),
    observacao: campoObs.value.trim()
  };

  localStorage.setItem("demeter_dados", JSON.stringify(dados));

  msgFeedback.innerText = "Informações salvas com sucesso!";
  msgFeedback.style.color = "#183f28";
}

// Monta a tabela consolidada na tela da cozinha e calcula o total
function atualizarTabela() {
  const dados = pegarDados();
  let soma = 0;

  tabelaCorpo.innerHTML = "";

  turmas.forEach(nomeTurma => {
    let quantidade = 0;
    let observacao = "-";

    if (dados[nomeTurma]) {
      quantidade = Number(dados[nomeTurma].quantidade) || 0;
      if (dados[nomeTurma].observacao) {
        observacao = dados[nomeTurma].observacao;
      }
    }

    soma += quantidade;

    const linha = document.createElement("tr");

    const tdTurma = document.createElement("td");
    tdTurma.innerText = nomeTurma;

    const tdQtd = document.createElement("td");
    tdQtd.innerText = quantidade;

    const tdObs = document.createElement("td");
    tdObs.innerText = observacao;

    linha.appendChild(tdTurma);
    linha.appendChild(tdQtd);
    linha.appendChild(tdObs);

    tabelaCorpo.appendChild(linha);
  });

  campoTotal.innerText = soma + " refeições";
}

// Insere a imagem do cardápio em um elemento HTML
function renderizarImagem(container, base64Img) {
  container.innerHTML = "";

  if (!base64Img) {
    container.innerText = "Nenhum cardápio cadastrado.";
    return;
  }

  const imagem = document.createElement("img");
  imagem.src = base64Img;
  imagem.alt = "Cardápio do Mês";
  container.appendChild(imagem);
}

// Exibe o cardápio na tela pública
function verCardapio() {
  const cardapioSalvo = localStorage.getItem("demeter_cardapio");
  renderizarImagem(cardapioArea, cardapioSalvo);
}

// Exibe a prévia do cardápio na tela de gerenciamento
function atualizarPreview() {
  const cardapioSalvo = localStorage.getItem("demeter_cardapio");
  renderizarImagem(previewArea, cardapioSalvo);
}

// Processa e salva a imagem do cardápio no localStorage
function salvarMenu() {
  const arquivo = inputArquivo.files[0];

  if (!arquivo) {
    msgMenuFeedback.innerText = "Selecione um arquivo de imagem.";
    msgMenuFeedback.style.color = "#c0392b";
    return;
  }

  // Limite de 2 MB
  if (arquivo.size > 2 * 1024 * 1024) {
    msgMenuFeedback.innerText = "A imagem deve ter menos de 2 MB.";
    msgMenuFeedback.style.color = "#c0392b";
    return;
  }

  const leitor = new FileReader();

  leitor.onload = function() {
    try {
      localStorage.setItem("demeter_cardapio", leitor.result);
      msgMenuFeedback.innerText = "Cardápio salvo com sucesso!";
      msgMenuFeedback.style.color = "#183f28";
      atualizarPreview();
    } catch (erro) {
      msgMenuFeedback.innerText = "Erro: espaço insuficiente no navegador para esta imagem.";
      msgMenuFeedback.style.color = "#c0392b";
    }
  };

  leitor.readAsDataURL(arquivo);
}

// Inicializa a grade de botões ao carregar a página
criarBotoesTurmas();