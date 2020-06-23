import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import {
  ChatMessage,
  ChatResponseOption,
  ResponseCustomAction,
  mockMessageGenerator,
} from "./message.model";
import { AnimationOptions } from "ngx-lottie";
import {
  NotificationService,
  IRapidProMessage,
} from "../services/notification.service";
import { IonContent } from "@ionic/angular";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit {
  messages: ChatMessage[] = [];
  allMessages: ChatMessage[] = [];
  responseOptions: ChatResponseOption[] = [];

  botBlobState:
    | "walking-in"
    | "walking-out"
    | "talking"
    | "run-in"
    | "still"
    | "absent";
  backgroundBlobVisible: boolean = false;
  botAnimOptions: AnimationOptions = {
    loop: false,
    path: "/assets/lottie-animations/Walk_In_Entrance_Pass_v2.json",
  };

  @ViewChild("messagesContent", { static: false })
  private messagesContent: IonContent;
  scrollingInterval: any;

  constructor(
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!window["cordova"]) {
      mockMessageGenerator((msg) => {
        if (
          msg.sender === "user" &&
          msg.responseOptions &&
          msg.responseOptions[0] &&
          msg.responseOptions[0].customAction
        ) {
          this.doCustomResponseAction(msg.responseOptions[0].customAction);
        }
        this.onReceiveMessage(msg);
      });
    } else {
      this.notificationService.messageSubject
        .asObservable()
        .subscribe((msg) => {
          this.onReceiveRapidProMessage(msg);
        });
      setTimeout(() => {
        this.notificationService.sendRapidproMessage("start_demo");
        this.botBlobState = "still";
      }, 3000);
    }
  }

  onReceiveRapidProMessage(rapidMsg: IRapidProMessage) {
    let chatMsg: ChatMessage = {
      sender: "bot",
      text: rapidMsg.body,
    };
    if (rapidMsg.quick_replies) {
      try {
        chatMsg.responseOptions = JSON.parse(
          rapidMsg.quick_replies
        ).map((word) => ({ text: word }));
      } catch (ex) {
        console.log("Error parsing quick replies", ex);
      }
    }
    setTimeout(() => {
      this.onReceiveMessage(chatMsg);
    });
  }

  onReceiveMessage(message: ChatMessage) {
    console.log(
      "Got to the bit where I do something with the messages!",
      message
    );
    message.dateReceived = new Date();
    this.allMessages.push(message);
    if (message.sender === "bot") {
      if (this.botBlobState === "still") {
        setTimeout(() => {
          this.botAnimOptions = {
            path: "assets/lottie-animations/TalkingGesture_Pass_v1.json",
            loop: false,
          };
        });
      }
      this.responseOptions = message.responseOptions
        ? message.responseOptions
        : [{ text: "no" }];
    } else {
      this.responseOptions = [];
    }
    /* if (this.allMessages.filter((msg) => msg.sender === "user").length > 0) {
      this.messages = [];
      for (var i = this.allMessages.length - 1; i > 0; i--) {
        if (this.allMessages[i].sender !== message.sender) {
          this.messages.push(this.allMessages[i]);
          break;
        } else {
          this.messages.push(this.allMessages[i]);
        }
      }
    } else {
      this.messages = this.allMessages;
    } 
    this.messages = this.messages.sort((a, b) => a.dateReceived.getTime() - b.dateReceived.getTime());
    */
    /* let botMessages = this.allMessages.filter((msg) => msg.sender === "bot");
    let userMessages = this.allMessages.filter((msg) => msg.sender === "user");
    this.messages = [];
    if (botMessages.length > 0) {
      this.messages.push(botMessages.pop());
    }
    if (userMessages.length > 0) {
      this.messages.push(userMessages.pop());
    } */
    this.messages = this.allMessages.slice(this.allMessages.length - 2);
    this.messagesContent.scrollToBottom(2000);
    this.cd.detectChanges();
  }

  doCustomResponseAction(action: ResponseCustomAction) {
    if (action === "bot-leave") {
      this.botAnimOptions = {
        loop: false,
        path: "/assets/lottie-animations/Walk_Out_Exit_Pass_v2.json",
      };
      this.botBlobState = "walking-out";
      setTimeout(() => (this.botBlobState = "absent"), 4200);
    } else if (action === "bot-return") {
      this.botBlobState = "run-in";
      this.botAnimOptions = {
        loop: false,
        path: "/assets/lottie-animations/Run_In_Entrance_Pass_v2.json",
      };
      setTimeout(() => (this.botBlobState = "still"), 3200);
    }
  }

  sendCustomOption(text: string) {
    this.notificationService.sendRapidproMessage(text);
    this.onReceiveMessage({
      text: text,
      sender: "user",
    });
  }

  selectResponseOption(option: ChatResponseOption) {
    console.log("Selected option", option);
    if (option.customAction) {
      this.doCustomResponseAction(option.customAction);
    }
    this.notificationService.sendRapidproMessage(option.text);
    this.onReceiveMessage({
      text: option.text,
      sender: "user",
    });
  }

  showAllMessages() {
    this.messages = this.allMessages;
  }
}
