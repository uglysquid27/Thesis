import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CountService } from '../../service/CountService';
import { NavigationEnd, Router } from '@angular/router';
// import { TokenStorageService } from 'src/app/service/auth/token-storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild('signOutModal') ModalElement!: ElementRef;
  boolModal: boolean = false;
  boolDropdown: Boolean = false;
  hideElement: Boolean = true;
  boolAcc: Boolean = false;
  user: any
  operatorLevel: boolean = false;
  supervisorLevel: boolean = false;
  plannerLevel: boolean = false;
  purchasinLevel: boolean = false;
  adminLevel: boolean = false
  user_level: any
  byId: any[] = []
  private hasReloaded: boolean = false;

  constructor(
    private countService: CountService,
    public router: Router) {
    // //////////////console.log(this.router.url)
  }

  ngOnInit() {


  }

  onMouseEnter() {
    this.hideElement = false;
    //////////////console.log(this.hideElement);
  }
  onMouseOut() {
    //////////////console.log('out');
    this.boolDropdown = false;
    this.hideElement = true;
    //////////////console.log(this.hideElement);
  }

  dropdown() {
    this.boolDropdown = !this.boolDropdown;
  }
  AccountDropdown() {
    this.boolAcc = !this.boolAcc;
  }

  falseAll(event: any) {
    // //////////////console.log(this.menuList.nativeElement);
    // //////////////console.log(event.target);

    if (
      this.ModalElement &&
      this.ModalElement.nativeElement.contains(event.target)
    ) {
      // //////////////console.log('test1');
    }
  }
  signOutModal() {
    this.boolModal = !this.boolModal;
  }
}
