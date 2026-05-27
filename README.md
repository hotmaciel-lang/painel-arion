#PAINEL ARION

Sistema web interno desenvolvido para gerenciamento operacional de provedores, links e atendimentos da Arion.

#FUNCIONALIDADES:

Busca de provedores por:
    -cidade
    -UF
    -nome
    -CEP

Integração com:
    -Supabase
    -ViaCEP
    -OpenStreetMap / Leaflet

Central de Links
    -cadastro de links
    -busca dinâmica
    -cópia rápida
    -abertura direta

Cadastro de provedores
    -inserção em tempo real no banco
    -integração com Supabase

Mapa interativo
    -localização automática
    -cálculo de proximidade
    -ordenação por distância

Destaque para:
    -provedores VIP
    -gerente de contas
    -cobertura por UF
     
Painel visual moderno
    -tema dark
    -identidade visual Arion
    -navegação dinâmica

---

#TECNOLOGIAS USADAS:

    -HTML5
    -CSS3
    -JavaScript Vanilla
    -Supabase
    -Leaflet.js
    -ViaCEP API
    -OpenStreetMap Nominatim

---

#ESTRUTURA DO PROJETO:

    Painel-Arion/
    │
    ├── index.html
    ├── style.css
    ├── app.js
    ├── config.js
    ├── logo-arion.png

---
#BANCO DE DADOS:

    Tabela Provedores:
        -nome
        -whatsapp
        -whatsapp_gc
        -link_web
        -ufs
        -latitude
        -longitude

    Tabela Links:
        -titulo
        -url
        -categoria
        -descricao
        -favorito

---

#OBJETIVO:

    Centralizar e agilizar operações internas da equipe Arion através de um painel moderno, intuitivo e integrado à nuvem.


#AUTOR:

Desenvolvido por Davi Santos Maciel para uso interno da Arion.