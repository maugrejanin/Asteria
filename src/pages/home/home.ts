import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

declare var ApiAIPromises: any;

class Chat {
  type: string;
  message: string;
  createdAt: Date;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [SpeechRecognition, TextToSpeech]
})
export class HomePage {

  chats: Array<Chat> = [];
  listening = false;
  message: string;

  constructor(
    public navCtrl: NavController,
    public ngZone: NgZone,
    public platform: Platform,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech) {
    platform.ready().then(() => {
      ApiAIPromises.init({
        clientAccessToken: "769af9a04dac4a8495ef3802c14ccd30",
        lang:'pt-BR'
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

  sendMessage() {
    this.addChat(this.message, 'user');
    ApiAIPromises.requestText({
      query: this.message
    })
      .then(({ result: { fulfillment: { speech } } }) => {
        this.ngZone.run(() => {
          this.tts.speak({ text: speech, locale: 'pt-BR', rate: 1.6 })
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
          this.addChat(speech, 'bot');
        });
      })
  }

  async sendText() {
    try {
    this.addChat(this.message, 'user');
    this.addChat((await ApiAIPromises.requestText({query: this.message})).result.fulfillment.speech, 'bot')
    } catch (e) {
      console.log('errorere:', e);
    }
  }

  async sendVoice() {
    ApiAIPromises.requestVoice({query: this.message}
      )
      .then(function (response) {
          // some response processing
          console.log('success', response);
      })
      .fail(function (error) {
          // some error processing
          console.log(error);
      });
    // try {
    //   // this.addChat(this.message, 'user');
    //   console.log(await ApiAIPromises.requestVoice());
    //   // this.addChat((await ApiAIPromises.requestVoice({query: this.message})).result.fulfillment.speech, 'bot')
    //   } catch (e) {
    //     console.log('errorere:', e);
    //   }
    // try {
    // this.addChat(this.message, 'user');

    //   ApiAIPromises.levelMeterCallback(function (level) {
    //     console.log(level);
    //   });

    //   ApiAIPromises.requestVoice(
    //     {}, // empty for simple requests, some optional parameters can be here
    //     function (response) {
    //       console.log(response)
    //       // place your result processing here
    //       alert(JSON.stringify(response));
    //     },
    //     function (error) {
    //       // place your error processing here
    //       alert(error);
    //     });
    // } catch (e) {
    //   alert(e);
    // }
  }

  addChat(message: string, type: string) {
    this.chats.push({ message: message, type: type, createdAt: new Date() });
  }

  startListen() {
    if (!this.listening) {
      this.listening = true;
      this.speechRecognition.startListening({ language: 'pt-BR' })
        .subscribe(
          (matches: Array<string>) => {
            alert(matches);
            this.sendMessage();
          },
          (onerror) => console.log('error:', onerror)
        )
    } else {
      this.listening = false;
      this.speechRecognition.stopListening();
    }
  }

  cancelar(){
    ApiAIPromises.cancelAllRequests();
  }

}
