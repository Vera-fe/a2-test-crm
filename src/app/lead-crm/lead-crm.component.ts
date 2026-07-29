import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {RouterModule} from '@angular/router';
import {MatDividerModule} from '@angular/material/divider'

// Интерфейс для лида
export interface Lead {
    id: string;
    name: string;
    phone: string;
    source: 'cold' | 'warm';
    responsible: 'leaderub' | 'mop';
    stage: 'new' | 'qualified' | 'consultation' | 'refusal';
    requestedTz: boolean;
    createdAt: Date;
}

@Component({
    selector: 'app-lead-crm',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDividerModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        FlexLayoutModule,
        RouterModule
    ],
    templateUrl: './lead-crm.component.html',
    styleUrls: ['./lead-crm.component.scss']
})
export class LeadCrmComponent implements OnInit {
    leads: Lead[] = [];
    newLead: Partial<Lead> = {
        name: '',
        phone: '',
        source: 'cold',
        responsible: 'leaderub',
        stage: 'new',
        requestedTz: false
    };

    // Опции для селектов
    sources = [
        {value: 'cold', label: 'Холодный'},
        {value: 'warm', label: 'Тёплый'}
    ];

    responsibles = [
        {value: 'leaderub', label: 'Лидоруб'},
        {value: 'mop', label: 'МОП'}
    ];

    stages = [
        {value: 'new', label: 'Новый лид'},
        {value: 'qualified', label: 'Квалифицирован'},
        {value: 'consultation', label: 'Назначена консультация'},
        {value: 'refusal', label: 'Отказ'}
    ];

    constructor(private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.loadLeads();
    }

    // Логика сохранения
    onSubmit(form: NgForm): void {
        // Проверка обязательных полей
        if (!this.newLead.name?.trim() && !this.newLead.phone?.trim()) {
            this.snackBar.open('Заполните обязательные поля: Имя и Телефон', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        if (!this.newLead.name?.trim()) {
            this.snackBar.open('Заполните обязательное поле "Имя клиента"', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        if (!this.newLead.phone?.trim()) {
            this.snackBar.open('Заполните обязательное поле "Номер телефона"', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Создание нового лида
        const lead: Lead = {
            id: Date.now().toString(),
            name: this.newLead.name.trim(),
            phone: this.newLead.phone.trim(),
            source: this.newLead.source as 'cold' | 'warm',
            responsible: this.newLead.responsible as 'leaderub' | 'mop',
            stage: this.newLead.stage as 'new' | 'qualified' | 'consultation' | 'refusal',
            requestedTz: this.newLead.requestedTz || false,
            createdAt: new Date()
        };

        this.leads.unshift(lead);
        this.saveLeads();
        this.sendLeadToApi(lead);
        this.resetForm(form);

        this.snackBar.open('Лид успешно добавлен!', 'OK', {
            duration: 2000,
            panelClass: ['success-snackbar']
        });
    }

    // Изменение этапа сделки
    changeStage(lead: Lead, newStage: string): void {
        lead.stage = newStage as Lead['stage'];
        this.saveLeads();
        this.snackBar.open(`Этап изменён на "${this.getStageLabel(newStage)}"`, 'OK', {
            duration: 1500
        });
    }

    // Удаление лида
    deleteLead(id: string): void {
        this.leads = this.leads.filter(lead => lead.id !== id);
        this.saveLeads();
    }

    // Сохранение в localStorage
    private saveLeads(): void {
        localStorage.setItem('leads', JSON.stringify(this.leads));
    }

    // Загрузка из localStorage
    private loadLeads(): void {
        const saved = localStorage.getItem('leads');
        if (saved) {
            try {
                this.leads = JSON.parse(saved).map((lead: any) => ({
                    ...lead,
                    createdAt: new Date(lead.createdAt)
                }));
            } catch (e) {
                console.error('Ошибка загрузки лидов:', e);
            }
        }
    }

    private resetForm(form: NgForm): void {
        this.newLead = {
            name: '',
            phone: '',
            source: 'cold',
            responsible: 'leaderub',
            stage: 'new',
            requestedTz: false
        };
        form.resetForm({
            source: 'cold',
            responsible: 'leaderub',
            stage: 'new',
            requestedTz: false
        });
    }

    // Вспомогательные методы
    getStageLabel(stage: string): string {
        return this.stages.find(s => s.value === stage)?.label || stage;
    }

    getSourceLabel(source: string): string {
        return this.sources.find(s => s.value === source)?.label || source;
    }

    getResponsibleLabel(responsible: string): string {
        return this.responsibles.find(r => r.value === responsible)?.label || responsible;
    }

    //Отображение запроса (будет с ошибкой, т.к. урл это заглушка)
    async sendLeadToApi(lead: Lead): Promise<void> {
        try {
            const response = await fetch('https://your-api.com/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lead)
            });

            if (response.ok) {
                this.snackBar.open('Лид отправлен в CRM', 'OK', {duration: 2000});
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            this.snackBar.open('Ошибка при отправке данных', 'OK', {duration: 3000});
        }
    }
}
