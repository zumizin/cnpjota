<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consultor de CNPJ Profissional</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; }
        .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .search-box { display: flex; gap: 10px; margin-bottom: 20px; }
        input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 4px; transition: 0.3s; }
        .btn-search { background-color: #007bff; color: white; }
        .btn-pdf { background-color: #28a745; color: white; margin-top: 20px; display: none; }
        #resultado { margin-top: 20px; line-height: 1.6; }
        .info-item { margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        strong { color: #333; }
    </style>
</head>
<body>

<div class="container">
    <h2>Consulta de Cartão CNPJ</h2>
    <div class="search-box">
        <input type="text" id="cnpjInput" placeholder="Digite apenas os números do CNPJ" maxlength="14">
        <button class="btn-search" onclick="consultarCNPJ()">Consultar</button>
    </div>

    <div id="resultado">
        </div>

    <button id="pdfBtn" class="btn-pdf" onclick="gerarPDF()">Gerar Relatório PDF</button>
</div>

<script>
    let dadosEmpresa = null;

    async function consultarCNPJ() {
        const cnpj = document.getElementById('cnpjInput').value.replace(/\D/g, '');
        const resultadoDiv = document.getElementById('resultado');
        const pdfBtn = document.getElementById('pdfBtn');

        if (cnpj.length !== 14) {
            alert("Por favor, digite um CNPJ válido com 14 dígitos.");
            return;
        }

        resultadoDiv.innerHTML = "Buscando informações...";

        try {
            // Utilizando JSONP para evitar problemas de CORS na versão gratuita da API
            const script = document.createElement('script');
            script.src = `https://receitaws.com.br/v1/cnpj/${cnpj}?callback=handleResponse`;
            document.body.appendChild(script);
        } catch (error) {
            resultadoDiv.innerHTML = "Erro ao consultar o servidor.";
        }
    }

    function handleResponse(data) {
        const resultadoDiv = document.getElementById('resultado');
        const pdfBtn = document.getElementById('pdfBtn');

        if (data.status === "ERROR") {
            resultadoDiv.innerHTML = `<p style="color:red;">Erro: ${data.message}</p>`;
            pdfBtn.style.display = 'none';
            return;
        }

        dadosEmpresa = data;
        pdfBtn.style.display = 'block';

        resultadoDiv.innerHTML = `
            <div class="info-item"><strong>Razão Social:</strong> ${data.nome}</div>
            <div class="info-item"><strong>Nome Fantasia:</strong> ${data.fantasia || 'Não informado'}</div>
            <div class="info-item"><strong>Situação:</strong> ${data.situacao}</div>
            <div class="info-item"><strong>Atividade Principal:</strong> ${data.atividade_principal[0].text}</div>
            <div class="info-item"><strong>Natureza Jurídica:</strong> ${data.natureza_juridica}</div>
            <div class="info-item"><strong>Capital Social:</strong> R$ ${parseFloat(data.capital_social).toLocaleString('pt-BR')}</div>
            <div class="info-item"><strong>Endereço:</strong> ${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}</div>
            <div class="info-item"><strong>Telefone:</strong> ${data.telefone}</div>
            <div class="info-item"><strong>E-mail:</strong> ${data.email}</div>
            <div class="info-item"><strong>Abertura:</strong> ${data.abertura}</div>
        `;
    }

    async function gerarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Relatório de Consulta CNPJ", 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Razão Social: ${dadosEmpresa.nome}`, 20, 40);
        doc.text(`CNPJ: ${dadosEmpresa.cnpj}`, 20, 50);
        doc.text(`Situação: ${dadosEmpresa.situacao}`, 20, 60);
        doc.text(`Atividade: ${dadosEmpresa.atividade_principal[0].text}`, 20, 70);
        doc.text(`Capital Social: R$ ${dadosEmpresa.capital_social}`, 20, 80);
        doc.text(`Endereço: ${dadosEmpresa.logradouro}, ${dadosEmpresa.numero}`, 20, 90);
        doc.text(`Cidade: ${dadosEmpresa.municipio} - ${dadosEmpresa.uf}`, 20, 100);
        doc.text(`Contato: ${dadosEmpresa.telefone} / ${dadosEmpresa.email}`, 20, 110);

        doc.save(`CNPJ_${dadosEmpresa.cnpj.replace(/\D/g, '')}.pdf`);
    }
</script>

</body>
</html>