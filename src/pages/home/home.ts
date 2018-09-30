import { Component } from '@angular/core';
import { NavController, Config } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController, private config: Config) {
    this.config.set('ios', 'backButtonText', 'Voltar');

  }

  ionViewDidLoad() {
  }

  chat(){
    this.navCtrl.push('ChatPage');
  }

}
