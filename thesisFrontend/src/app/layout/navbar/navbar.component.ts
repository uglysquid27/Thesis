import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public router: Router) {}

  currentDate = new Date();
  ngOnInit(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }
}