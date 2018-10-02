import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Navbar, Content, AlertController } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
declare var ApiAIPromises: any;


class Chat {
  type: string;
  message: string;
  createdAt: Date;
}

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [SpeechRecognition, TextToSpeech]

})
export class ChatPage {
  @ViewChild(Navbar) navBar: Navbar;
  chats: Array<Chat> = [];
  listening = false;
  message: string;
  btn_listen;
  timeout;
  vinhos = [];
  frutas = [];
  likeVinho = false;
  unlikeVinho = false;
  likeFrutas = false;
  unlikeFrutas = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public ngZone: NgZone,
    public platform: Platform,
    private alertCtrl: AlertController,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech) {
    this.vinhos = [{
      img: "assets/imgs/vinho1.jpg",
      desconto: 20,
      descricao: "Vinho periquita 750ml"
    }, {
      img: "assets/imgs/vinho2.jpg",
      desconto: 10,
      descricao: "Vinho Concha Y Toro 750 ml"
    }, {
      img: "assets/imgs/vinho3.jpg",
      desconto: 15,
      descricao: "inho Nacional Pérgola 1 Litro"
    }];

    this.frutas = [{
      img: "assets/imgs/fruta1.jpg",
      desconto: 20,
      descricao: "Maçã"
    }, {
      img: "assets/imgs/fruta2.jpg",
      desconto: 10,
      descricao: "Kiwi"
    }, {
      img: "assets/imgs/fruta3.jpg",
      desconto: 15,
      descricao: "Carambola"
    }];
    platform.ready().then(() => {
      let startPhrase = "Olá Letícia, como posso te ajudar?";
      this.addChat(startPhrase, "bot");
      ApiAIPromises.init({
        clientAccessToken: "076f9817cd1b404db747d4ba1bc4871c",
        lang: 'pt-BR'
      })

      this.speechRecognition.hasPermission()
        .then((hasPermission: boolean) => {
          if (!hasPermission) {
            // Request permissions
            this.speechRecognition.requestPermission()
              .then(
                () => console.log('Granted'),
                () => console.log('Denied')
              )
          }
        })

      ApiAIPromises.setListeningStartCallback(function () {
        console.log("listening started");
      });

      ApiAIPromises.setListeningFinishCallback(function () {
        console.log("listening stopped");
      });
    })
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = () => {
      this.cancelar();
      clearTimeout(this.timeout);
      this.navCtrl.pop();
    }
  }

  speechText(text) {
    try {
      this.ngZone.run(async () => {
        await this.tts.speak({ text: text, locale: 'pt-BR', rate: 1.6 });
      });
    } catch (error) {

    }
  }

  async sendMessage() {
    try {
      this.addChat(this.message, 'user');
      let responseMessage = (await ApiAIPromises.requestText({ query: this.message })).result.fulfillment.speech;
      this.addChat(responseMessage, 'bot');
      this.message = '';
    } catch (e) {
      console.log('errorere:', e);
    }
  }

  addChat(message: string, type: string) {
    if (type == 'bot') {
      if (message.toLowerCase() == "mostrar vinhos") {
        this.speechText("Essas são as ofertas de vinho de hoje");
        this.chats.push({ message: "vinho", type: "offer", createdAt: new Date() });
        this.timeout = setTimeout(() => {
          this.addChat("Posso te ajudar com mais alguma coisa?", "bot");
        }, 15000)
      } else if (message.toLowerCase() == "horti fruti") {
        this.speechText("Baseado no que você gosta, as ofertas dessa semana são");
        this.chats.push({ message: "horti fruti", type: "offer", createdAt: new Date() });
        this.timeout = setTimeout(() => {
          this.addChat("Se precisar, é só me chamar!", "bot");
        }, 5000);
      } else {
        this.speechText(message);
        this.chats.push({ message: message, type: type, createdAt: new Date() });
      }
    } else {
      this.chats.push({ message: message, type: type, createdAt: new Date() });
    }
  }

  startListen() {
    this.listening = true;
    this.speechRecognition.startListening({ language: 'pt-BR', showPartial: true })
      .subscribe(
        (matches: Array<string>) => {
          this.message = matches[0];
        },
        (onerror) => console.log('error:', onerror)
      )
  }

  stopListen() {
    this.speechRecognition.stopListening();
    if (this.message.length > 0) {
      this.sendMessage();
    }
  }

  ativarOferta() {
    this.alertCtrl.create({
      title: 'Confirmar desconto',
      message: 'Deseja realmente aplicar o desconto nesse produto?',
      buttons: [
        "Nao",
        {
          text: 'Sim',
          handler: () => {
            let alert = this.alertCtrl.create({
              buttons: ["OK"],
              title: "Confirmação",
              message: "Desconto aplicado."
            });
            alert.present();
            alert.onDidDismiss(() => {
              clearTimeout(this.timeout);
              this.navCtrl.pop();
            })
          }
        }
      ]
    }).present();
  }

  cancelar() {
    ApiAIPromises.cancelAllRequests();
  }

}
