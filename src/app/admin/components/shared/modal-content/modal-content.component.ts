import { Component, Input, OnInit } from '@angular/core';
import { ModalOptions } from './models/modal-options';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.css']
})
export class ModalContentComponent implements OnInit {

  @Input() options!: ModalOptions;

  constructor() { }

  ngOnInit(): void {
  }

}