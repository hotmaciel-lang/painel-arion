let provedores = [];
let map;
let marker;

const txtBusca = document.getElementById("txtBusca");
const txtCep = document.getElementById("txtCep");
const btnBuscar = document.getElementById("btnBuscar");
const btnCep = document.getElementById("btnCep");
const cards = document.getElementById("cards");
const resultado = document.getElementById("resultado");

const tituloPagina =
  document.getElementById("tituloPagina");

const areaBuscaProvedores =
  document.getElementById("areaBuscaProvedores");

const txtNovoNome = document.getElementById("txtNovoNome");
const txtNovoWhatsapp = document.getElementById("txtNovoWhatsapp");
const txtNovoWhatsappGC = document.getElementById("txtNovoWhatsappGC");
const txtNovoSite = document.getElementById("txtNovoSite");
const txtNovoUFs = document.getElementById("txtNovoUFs");
const btnSalvarProvedor = document.getElementById("btnSalvarProvedor");

const btnTelaProvedores =
  document.getElementById("btnTelaProvedores");

const btnTelaLinks =
  document.getElementById("btnTelaLinks");

const btnTelaCadastro =
  document.getElementById("btnTelaCadastro");

const telaCadastro =
  document.getElementById("telaCadastro");

const telaProvedores =
  document.getElementById("telaProvedores");

const btnNovoLink =
  document.getElementById("btnNovoLink");

const formNovoLink =
  document.getElementById("formNovoLink");

const txtLinkTitulo =
  document.getElementById("txtLinkTitulo");

const txtLinkUrl =
  document.getElementById("txtLinkUrl");

const txtLinkCategoria =
  document.getElementById("txtLinkCategoria");

const txtLinkDescricao =
  document.getElementById("txtLinkDescricao");

const btnSalvarLink =
  document.getElementById("btnSalvarLink");

const telaLinks =
  document.getElementById("telaLinks");

const txtBuscaLinks =
  document.getElementById("txtBuscaLinks");

const resVip = document.getElementById("resVip");
const resProv = document.getElementById("resProv");
const resLocal = document.getElementById("resLocal");

const comboFat = document.getElementById("comboFat");
const arquivoFat = document.getElementById("arquivoFat");
const btnCopiarFat = document.getElementById("btnCopiarFat");

const btnTema =
  document.getElementById("btnTema");

let dadosFaturamento = [];

function iniciarMapa() {
  map = L.map("map").setView([-14.235, -51.9253], 4);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: "OpenStreetMap, CARTO"
  }).addTo(map);

  setTimeout(() => {
  map.invalidateSize();
}, 300);

}

async function localizarNoMapa(texto) {
  if (!texto) return;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=" +
    encodeURIComponent(texto);

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!dados || dados.length === 0) return;

    const local = dados[0];
    const lat = parseFloat(local.lat);
    const lon = parseFloat(local.lon);

    window.ultimaLatitude = lat;
    window.ultimaLongitude = lon;

    map.setView([lat, lon], 12);

    if (marker) {
      marker.remove();
    }

    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(local.display_name)
      .openPopup();
  } catch {
    console.log("Erro ao localizar no mapa.");
  }
}

async function carregarProvedores() {
  const resposta = await fetch(SUPABASE_URL, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });

  if (!resposta.ok) {
    throw new Error("Erro ao buscar dados no Supabase.");
  }

  provedores = await resposta.json();
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function ehVip(provedor) {
  const gc = String(provedor.whatsapp_gc || "");
  return gc.trim() !== "" && !gc.startsWith("http");
}

function extrairTagsUF(ufs) {
  if (!ufs) return [];

  return String(ufs)
    .split("/")
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const match = item.match(/^(.+?)\((.+)\)$/);

      if (match) {
        return {
          uf: match[1].trim(),
          cidades: match[2].trim()
        };
      }

      return {
        uf: item,
        cidades: "Sem cidades detalhadas."
      };
    });
}

function criarCard(provedor) {
  const vip = ehVip(provedor);

  const nome = provedor.nome || "SEM NOME";
  const whats = provedor.whatsapp || "";
  const gc = provedor.whatsapp_gc || "";
  const site = provedor.link_web || "";
  const tags = extrairTagsUF(provedor.ufs);
  const distanciaTexto =
  provedor.distanciaKm !== undefined
    ? `${provedor.distanciaKm.toFixed(1)} km de distancia`
    : "";

  const card = document.createElement("article");
  card.className = vip ? "card vip" : "card";

  const numeroWhats = String(whats).replace(/\D/g, "");
  const numeroGc = String(gc).replace(/\D/g, "");

  card.innerHTML = `
    <div class="card-header">
      <div>
        <h2>${nome.toUpperCase()}</h2>
        <small>
          ${
            distanciaTexto
            ? distanciaTexto
            : vip
              ? "Atendimento prioritario"
              : "Provedor cadastrado"
          }
        </small>
      </div>

      ${vip ? `<span class="badge">ATENDIMENTO VIP</span>` : ""}
    </div>

    ${
      whats
        ? `
        <div class="field">
          <span>WHATSAPP ATENDIMENTO</span>

          <div class="contact-row">
            <div class="contact-value">${whats}</div>

            <button data-copy="${whats}">Copiar</button>

            <a href="https://wa.me/${numeroWhats}" target="_blank">
              Chamar
            </a>

            <button data-copy="Olá tudo bem? Você poderia verificar por gentileza se possuem viabilidade para um endereço?">
              Msg
            </button>
          </div>
        </div>`
        : ""
    }

    ${
      gc && !String(gc).startsWith("http")
        ? `
        <div class="field">
          <span>GERENTE DE CONTAS</span>

          <div class="contact-row">
            <div class="contact-value">${gc}</div>

            <button data-copy="${gc}">Copiar</button>

            <a href="https://wa.me/${numeroGc}" target="_blank">
              Chamar GC
            </a>
          </div>
        </div>`
        : ""
    }

    ${
      site && String(site).startsWith("http")
        ? `
        <div class="field">
          <span>SITE OFICIAL</span>

          <div class="site-row">
            <a href="${site}" target="_blank">
              Abrir Website
            </a>
          </div>
        </div>`
        : ""
    }

    ${
      tags.length
        ? `
        <div class="field">
          <span>COBERTURA - CLIQUE NA UF PARA VER CIDADES</span>

          <div class="tags">
            ${tags
              .map(
                tag =>
                  `<button class="tag" title="${tag.cidades}">${tag.uf}</button>`
              )
              .join("")}
          </div>
        </div>`
        : ""
    }
  `;

  card.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.dataset.copy);

      const textoOriginal = btn.textContent;
      btn.textContent = "Copiado";

      setTimeout(() => {
        btn.textContent = textoOriginal;
      }, 1200);
    });
  });

  card.querySelectorAll(".tag").forEach(tag => {
    tag.addEventListener("click", () => {
      mostrarCobertura(tag.textContent, tag.title);
    });
  });

  return card;
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function buscar() {
  const termoOriginal = txtBusca.value.trim();
  const termo = normalizar(termoOriginal);

  cards.innerHTML = "";

  if (!termo) {
    resultado.textContent = "Digite uma cidade, UF, CEP ou nome do provedor.";
    return;
  }

  window.ultimaLatitude = null;
  window.ultimaLongitude = null;

await localizarNoMapa(termoOriginal);

  const encontrados = provedores.filter(p => {
    const texto = normalizar(
      `${p.nome} ${p.whatsapp} ${p.whatsapp_gc} ${p.link_web} ${p.ufs}`
    );

    return texto.includes(termo);
  });

  if (window.ultimaLatitude && window.ultimaLongitude) {
  encontrados.forEach(p => {
    if (p.latitude && p.longitude) {
      p.distanciaKm = calcularDistanciaKm(
        window.ultimaLatitude,
        window.ultimaLongitude,
        Number(p.latitude),
        Number(p.longitude)
      );
    }
  });

  encontrados.sort((a, b) => {
    const da = a.distanciaKm ?? 999999;
    const db = b.distanciaKm ?? 999999;

    return da - db;
  });
}

  const vips = encontrados.filter(ehVip);
  const comuns = encontrados.filter(p => !ehVip(p));

  resVip.textContent = vips.length;
  resProv.textContent = encontrados.length;
  resLocal.textContent = termoOriginal || "-";

  resultado.textContent =
    encontrados.length === 0
      ? `Nenhum resultado para: ${termoOriginal}`
      : `Resultados para: ${termoOriginal} - ${encontrados.length} provedor(es)`;

  [...vips, ...comuns].forEach(p => {
    cards.appendChild(criarCard(p));
  });

  localizarNoMapa(termoOriginal);
}

async function buscarCep() {
  const cep = txtCep.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    alert("Digite um CEP valido com 8 numeros.");
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP nao encontrado.");
      return;
    }

    txtBusca.value = dados.localidade;
    buscar();
    localizarNoMapa(`${dados.localidade} ${dados.uf}`);
  } catch {
    alert("Nao foi possivel consultar o CEP.");
  }
}

btnBuscar.addEventListener("click", buscar);
btnCep.addEventListener("click", buscarCep);

txtBusca.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    buscar();
  }
});

txtCep.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    buscarCep();
  }
});

async function iniciar() {
  iniciarMapa();

  try {
    await carregarProvedores();
    await carregarFaturamento();

    resultado.textContent =
      "Base carregada. Digite uma cidade, UF ou provedor.";
  } catch (erro) {

    resultado.textContent =
      "Erro ao carregar dados. Verifique Supabase, chave e policies.";

    console.error(erro);
  }
}

async function carregarFaturamento() {
  const resposta = await fetch(SUPABASE_FAT_URL + "?select=*&order=uf.asc", {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });

  if (!resposta.ok) {
    throw new Error("Erro ao carregar dados de faturamento.");
  }

  dadosFaturamento = await resposta.json();

  comboFat.innerHTML = `<option value="">-- Selecione a Unidade --</option>`;

  dadosFaturamento.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.uf;
    comboFat.appendChild(option);
  });
}

function copiarModeloFaturamento() {
  const index = comboFat.value;

  if (index === "") {
    alert("Selecione uma unidade primeiro.");
    return;
  }

  const linha = dadosFaturamento[Number(index)];

  if (!linha) {
    alert("Dados de faturamento nao encontrados.");
    return;
  }

  const texto = `CNPJ: ${linha.cnpj}
I.E.: ${linha.ie || "ISENTO"}
I.M.: ${linha.im || "ISENTO"}
Razao Social: ARION SERVICOS DE TELECOMUNICACOES LTDA
Nome Fantasia: ARION
Data de abertura: ${linha.data_abertura}

Nome responsavel: Vinicius Gremes Leite
Telefone Solicitante: +55 11 98919-6264
Telefone Agendamentos: +55 11 94577-5843

Email Solicitante: davi.maciel.arion@gmail.com
Email Arion: viabilidade.gro@grupoarion.com.br
Email BOLETOS: nfe@grupoarion.com.br

ENDERECO DE COBRANCA: ${linha.endereco}`;

  navigator.clipboard.writeText(texto);
  alert("Modelo Arion copiado.");
}

btnCopiarFat.addEventListener("click", copiarModeloFaturamento);



async function carregarLinks() {

  const listaLinks =
    document.getElementById("listaLinks");

    console.log("LISTA LINKS ELEMENTO:", listaLinks);

  listaLinks.innerHTML = "";

  try {

    const resposta = await fetch(
      SUPABASE_LINKS_URL + "?select=*",
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const links = await resposta.json();

    window.linksCarregados = links;

    console.log("LINKS RECEBIDOS:", links);

    renderizarLinks(links);

  } catch (erro) {

    console.error("Erro ao carregar links:", erro);

  }

}

window.addEventListener("DOMContentLoaded", () => {
  const btnTelaProvedores = document.getElementById("btnTelaProvedores");
  const btnTelaLinks = document.getElementById("btnTelaLinks");
  const telaProvedores = document.getElementById("telaProvedores");
  const telaLinks = document.getElementById("telaLinks");

  btnTelaLinks.addEventListener("click", () => {
    console.log("CLICOU CENTRAL");

    telaCadastro.classList.add("hidden");
    telaProvedores.classList.add("hidden");
    telaLinks.classList.remove("hidden");
    areaBuscaProvedores.classList.add("hidden");
    tituloPagina.textContent = "Central de Links";

    carregarLinks();

    btnTelaLinks.classList.add("active");
    btnTelaProvedores.classList.remove("active");
    btnTelaCadastro.classList.remove("active");
  });

  btnTelaProvedores.addEventListener("click", () => {
    telaLinks.classList.add("hidden");
    telaCadastro.classList.add("hidden");
    telaProvedores.classList.remove("hidden");
    areaBuscaProvedores.classList.remove("hidden");
    tituloPagina.textContent = "Busca de Provedores";

    btnTelaProvedores.classList.add("active");
    btnTelaLinks.classList.remove("active");
    btnTelaCadastro.classList.remove("active");
  });

  btnTelaCadastro.addEventListener("click", () => {

    telaProvedores.classList.add("hidden");
    telaLinks.classList.add("hidden");

    telaCadastro.classList.remove("hidden");
    areaBuscaProvedores.classList.add("hidden");
    tituloPagina.textContent = "Cadastro de Provedores";

    btnTelaCadastro.classList.add("active");

    btnTelaLinks.classList.remove("active");
    btnTelaProvedores.classList.remove("active");

  });

  btnNovoLink.addEventListener("click", () => {

    formNovoLink.classList.toggle("hidden");

  });

  document
  .getElementById("btnFecharCobertura")
  .addEventListener("click", () => {
    document
      .getElementById("painelCobertura")
      .classList.add("hidden");
  });

  btnSalvarProvedor.addEventListener("click", async () => {
  const nome = txtNovoNome.value.trim();
  const whatsapp = txtNovoWhatsapp.value.trim();
  const whatsapp_gc = txtNovoWhatsappGC.value.trim();
  const link_web = txtNovoSite.value.trim();
  const ufs = txtNovoUFs.value.trim();

  if (!nome || !whatsapp || !ufs) {
    alert("Preencha pelo menos nome, WhatsApp e UFs.");
    return;
  }

  try {
    const resposta = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        nome,
        whatsapp,
        whatsapp_gc,
        link_web,
        ufs
      })
    });

    if (!resposta.ok) {
      throw new Error("Erro ao cadastrar provedor.");
    }

    txtNovoNome.value = "";
    txtNovoWhatsapp.value = "";
    txtNovoWhatsappGC.value = "";
    txtNovoSite.value = "";
    txtNovoUFs.value = "";

    await carregarProvedores();

    alert("Provedor cadastrado com sucesso.");
  } catch (erro) {
    console.error(erro);
    alert("Nao foi possivel cadastrar o provedor.");
  }
  });

    btnTema.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const claro =
      document.body.classList.contains("light-mode");

    btnTema.textContent =
      claro
        ? " ⏾"
        : "☀︎";

});


btnSalvarLink.addEventListener("click", async () => {

  const titulo = txtLinkTitulo.value.trim();
  const url = txtLinkUrl.value.trim();
  const categoria = txtLinkCategoria.value.trim();
  const descricao = txtLinkDescricao.value.trim();

  if (!titulo || !url) {

    alert("Preencha titulo e URL.");
    return;

  }

  try {

    const resposta = await fetch(
      SUPABASE_LINKS_URL,
      {
        method: "POST",

        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },

        body: JSON.stringify({
          titulo,
          url,
          categoria,
          descricao,
          favorito: false
        })
      }
    );

    if (!resposta.ok) {

      throw new Error("Erro ao salvar link.");

    }

    txtLinkTitulo.value = "";
    txtLinkUrl.value = "";
    txtLinkCategoria.value = "";
    txtLinkDescricao.value = "";

    formNovoLink.classList.add("hidden");

    carregarLinks();

    alert("Link salvo com sucesso.");

  } catch (erro) {

    console.error(erro);

    alert("Nao foi possivel salvar o link.");

  }

});

});

txtBuscaLinks.addEventListener("input", () => {
  const termo = normalizar(txtBuscaLinks.value);

  const filtrados = (window.linksCarregados || []).filter(link => {
    const texto = normalizar(`
      ${link.titulo}
      ${link.url}
      ${link.categoria}
      ${link.descricao}
    `);

    return texto.includes(termo);
  });

  renderizarLinks(filtrados);
});


function renderizarLinks(links) {
  const listaLinks = document.getElementById("listaLinks");

  listaLinks.innerHTML = "";

  links.forEach(link => {
    const card = document.createElement("div");
    card.className = "link-card";

    card.innerHTML = `
      <div class="link-category">
        ${link.categoria || "Sem categoria"}
      </div>

      <h3>${link.titulo}</h3>

      <p>${link.descricao || ""}</p>

      <div class="link-actions">
        <a href="${link.url}" target="_blank">
          Abrir
        </a>

        <button class="btnCopiarLink">
          Copiar
        </button>
      </div>
    `;

    card
      .querySelector(".btnCopiarLink")
      .addEventListener("click", () => {
        navigator.clipboard.writeText(link.url);
      });

    listaLinks.appendChild(card);

  });


}

function mostrarCobertura(uf, cidadesTexto) {
  const painel = document.getElementById("painelCobertura");
  const titulo = document.getElementById("coverageUf");
  const lista = document.getElementById("coverageCidades");

  titulo.textContent = `Cobertura em ${uf}`;

  const cidades = String(cidadesTexto)
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);

  lista.innerHTML = cidades
    .map(cidade => `<span>${cidade}</span>`)
    .join("");

  painel.classList.remove("hidden");
}

iniciar();