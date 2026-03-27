import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/core/services/api.service';
import { SessionService } from 'src/app/core/session/session.service';
import {
  login,
} from 'src/app/store/Authentication/authentication.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Caso não use Standalone, remova "standalone" e adicione o componente ao módulo.
  submitting = false;
  showModal = false;               

  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private store: Store,
    private service: ApiService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    if (this.sessionService.hasSession()) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validatyion
     */
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  // Fecha ao clicar fora do conteúdo
  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('custom-modal')) {
      this.closeModal();
    }
  }

  onSubmit() {
   
    this.submitted = true;

    const email = this.f['email'].value; // Get the username from the form
    const password = this.f['password'].value; // Get the password from the form

    this.store.dispatch(login({ email: email, password: password }));

    
  }
}
