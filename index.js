const express = require('express');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Cliente do WhatsApp com sessão persistente
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
});

const aguardandoNota = new Map();

// Rota para o formulário enviar número
app.post('/enviar', (req, res) => {
    const numero = req.body.numero.replace(/\D/g, ''); // limpa caracteres
    const chatId = `${numero}@c.us`;

    const mensagem = 'Olá, gostaria que avaliasse o nosso atendimento com uma nota de 0 a 10 😊';

    client.sendMessage(chatId, mensagem)
        .then(() => {
            aguardandoNota.set(chatId, true);
            res.send(`<h2>Mensagem enviada para ${numero}!</h2><a href="/">Voltar</a>`);
        })
        .catch(err => {
            console.error(err);
            res.send(`<h2>Erro ao enviar mensagem!</h2><a href="/">Voltar</a>`);
        });
});

// Escuta respostas dos clientes
client.on('message', async msg => {
    const numero = msg.from;
    const texto = msg.body.trim();

    if (aguardandoNota.has(numero)) {
        if (/^\d+$/.test(texto)) {
            const nota = parseInt(texto);
            let resposta = '';

            if (nota >= 0 && nota <= 6) {
                resposta = 'Sentimos muito por não atender suas expectativas. Vamos melhorar!';
            } else if (nota >= 7 && nota <= 8) {
                resposta = 'Obrigado! Sua opinião nos ajuda a evoluir.';
            } else if (nota >= 9 && nota <= 10) {
                resposta = 'Uau, obrigado pela nota alta! Ficamos felizes por sua satisfação!';
            } else {
                resposta = 'Por favor, envie uma nota válida de 0 a 10.';
            }

            await client.sendMessage(numero, resposta);
            aguardandoNota.delete(numero);
        } else {
            await client.sendMessage(numero, 'Por favor, envie apenas um número de 0 a 10.');
        }
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`🖥️ Servidor rodando em http://localhost:${port}`);
});
