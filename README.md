# nps-whatsapp-bot

Coleta de NPS por WhatsApp. Um formulário web dispara a pergunta para o número
informado; o bot aguarda a resposta, interpreta a nota e responde de acordo com
a faixa — detrator, neutro ou promotor.

## Uso

```bash
npm install
npm start
```

Abra `http://localhost:3000`, escaneie o QR Code impresso no terminal e envie
um número pelo formulário.

## Fluxo

```
formulário web  ->  POST /enviar  ->  mensagem no WhatsApp
                                            |
                                 cliente responde a nota
                                            |
               0-6 detrator  ·  7-8 neutro  ·  9-10 promotor
                                            |
                              resposta automática na faixa
```

## Detalhes de implementação

**Sessão persistente com `LocalAuth`.** Sem isso o QR Code precisa ser escaneado
a cada reinício, o que inviabiliza rodar como serviço.

**Estado de quem está aguardando nota.** Um `Map` guarda os números que
receberam a pergunta. Sem esse controle o bot responderia a qualquer mensagem
que chegasse, inclusive conversa que não tem nada a ver com a pesquisa.

**Resposta não numérica é tratada.** Cliente responde "10!" ou "dez" com
frequência. O bot pede o número de novo em vez de ignorar ou quebrar.

## Limitações conhecidas

`whatsapp-web.js` roda em cima do WhatsApp Web, não da API oficial da Meta.
Serve para volume baixo e uso interno. Para produção com volume o caminho é a
WhatsApp Business Cloud API, com template aprovado e janela de 24 horas.

O estado também vive em memória: reiniciar o processo perde quem estava
aguardando nota. Para uso real isso iria para Redis ou banco.

## Licença

MIT
