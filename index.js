/*
Um bot simples para administração de grupos no whatsapp feito em nodejs.
Criado por: Leonel Miguins.
Não esqueça de adicionar o bot como administrador do grupo!
*/

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require("fs");

//criando cliente com LocalAuth para salvar e continuar seções após ler o Qr-Code.
const client = new Client({
  authStrategy: new LocalAuth(),
});
    
client.initialize();
client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

//authenticando uma sessão já existente
client.on('authenticated', () => {
  console.log('autenticado! continuando sessão...');
});

client.on('ready', () => {
  console.log("sessão estabelecida com sucesso!");
  
});

client.on('group_join', (notification) => {
   
  console.log('novo membro entrou no grupo!'); 
  notification.reply('_seja bem vindo! fique a vontade e aproveite a estadia e caso queira falar comigo envie */start*_');
});

client.on('group_update', (notification) => {

  console.log('update', notification);
  var id = notification.chatId;
  client.sendMessage(id, '_dados do grupo foram alterados!_');
  
});

// escutando menssagens recebidas
client.on('message', async (message)  => {

  if(message.body === '/start'){
    txt =
    "*O que esse bot pode fazer?*\n\n"+
    "✅ menssagem de boas vindas. [ _automático_ ]\n"+
    "✅ notifica todos do grupo.\n"+
    "✅ promove membros a adm.\n"+
    "✅ anti-link de grupos. [ _automático_ ]\n"+
    "✅ anti-link pornográficos. [ _automático_ ]\n\n"+
    "》 envie */cmd* para obter a lista de comandos.\n"

    client.sendMessage(message.from, txt)

  }

  if(message.body === '/cmd')
  {
    txt =
    "*comandos:*\n\n"+
    "》 promove membro a adm: */adm*\n"+
    "》 exibe as regras: */regras*\n"+
    "》 notifica todos: */notif*\n"+
    "》 sobre o bot: */bot*"

    client.sendMessage(message.from, txt)

  }

  //envia as regras do grupo
  if (message.body === '/regras') {
    //buscando as regras no arquivo 'regras.txt'
    var regras = readFile('regras.txt')
    var regras = '*Regras:*\n\n'+regras;

    client.sendMessage(message.from, regras);
  }

  if (message.body === '/bot') {
    const chats = await client.getChats();
    let info = client.info;
    const chat = await message.getChat();
    
    client.sendMessage(message.from, `*Informações do bot:*\n\nNome: *${info.pushname}*\nNúmero: *${info.wid.user}*\nPlataforma: *${info.platform}*\nGrupo: *${chat.name}*\nChats no Pv: *${chats.length}*`);
  }
  
  // promover membro a administrador
  if(message.body === '/adm'){ 
    client.sendMessage(message.from, '_envia o comando junto com o *@* do membro. exemplo: */adm @example*_');
  }

  if (message.body.includes('/adm @')){

      let chat = await message.getChat();
      var chat_id = chat.id._serialized;
      var chat_name = chat.name

      const mentions = await message.getMentions();
      var user = '';
      var user_name ='';
  
      for(let contact of mentions) {
          user = contact.id._serialized;
          user_name = contact.pushname;
      }
    
      chat = await client.getChatById(chat_id); // Group Id
      await chat.promoteParticipants([user]); // User Id
      console.log(`${user_name} foi promovido a adm no grupo: ${chat_name}`);
      chat.sendMessage(`_*${user_name}* foi promovido a adm no grupo: *${chat_name}*_`);
      

  }

  // excluir menssagens de membros que mandam links de outros canais
  if (message.body.includes('https://wa.me/') || message.body.includes('https://chat.whatsapp.com/')) {
    
     var x = client.getChatById(message.from);    
     client.sendMessage(message.from, '_proibido enviar links de grupos!_');
     message.delete(true);
     
  }

    // excluir menssagens de membros que mandam links pornográficos
    if (message.body.includes('pornhub.com') || message.body.includes('xvideos.com')) {
    
    var x = client.getChatById(message.from);    
    client.sendMessage(message.from, '_proibido enviar links pornográficos no grupos!_');
    message.delete(true);
    
 }

  // marcar todos os membros
  if(message.body === '/notif') {
    const chat = await message.getChat();
    
    let text = "_notificando:_ ";
    let mentions = [];

    for(let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        
        mentions.push(contact);
        text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
}

    
});

//função para ler arquivos .txt
function readFile(file){
  var dados = fs.readFileSync(file, "utf8");
   fs.close;
 
   return dados;
}

 
 