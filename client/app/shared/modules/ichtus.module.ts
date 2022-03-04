import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {MaterialModule} from './material.module';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AddressComponent} from '../components/address/address.component';
import {MoneyComponent} from '../components/money/money.component';
import {FocusDirective} from '../directives/focus';
import {CardComponent} from '../components/card/card.component';
import {NavigationsComponent} from '../components/navigations/navigations.component';
import {CommentComponent} from '../components/navigations/comment.component';
import {ParticleEffectButtonModule} from 'angular-particle-effect-button';
import {TransactionAmountComponent} from '../components/transaction-amount/transaction-amount.component';
import {AccountingDocumentsComponent} from '../../admin/accounting-documents/accounting-documents.component';
import {TimeagoModule} from 'ngx-timeago';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ParticleSwitchComponent} from '../components/particle-switch/particle-switch.component';
import {
    NaturalAlertModule,
    NaturalAvatarModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDialogTriggerModule,
    NaturalDropdownComponentsModule,
    NaturalFileModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalIconsConfig,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import {NaturalEditorModule} from '@ecodev/natural-editor';
import {SupportComponent} from '../../admin/configurations/support/support.component';
import {IbanPipe} from '../pipes/iban.pipe';
import {CopyContactDataComponent} from '../components/copy-contact-data/copy-contact-data.component';
import {ApolloModule} from 'apollo-angular';

const iconsConfig: NaturalIconsConfig = {
    qr: {
        svg: 'assets/icons/qr.svg',
    },
    'simple-qr': {
        svg: 'assets/icons/simple-qr.svg',
    },
    own_bookable: {
        svg: 'assets/icons/swimsuit.svg',
    },
    code: {
        svg: 'assets/icons/input.svg',
    },
    doors: {
        svg: 'assets/icons/key.svg',
    },
    family: {
        svg: 'assets/icons/family.svg',
    },
    lake: {
        svg: 'assets/icons/lake.svg',
    },
    transactionHistory: {
        svg: 'assets/icons/history.svg',
    },
    claims: {
        svg: 'assets/icons/claims.svg',
    },
    finances: {
        svg: 'assets/icons/notes.svg',
    },
    browse_bookables: {
        svg: 'assets/icons/search.svg',
    },
    administrator: {
        svg: 'assets/icons/boss.svg',
    },
    exit: {
        svg: 'assets/icons/exit.svg',
    },
    ichtus: {
        svg: 'assets/ichtus.svg',
    },
    support: {
        svg: 'assets/icons/signpost.svg',
    },
    announcement: {
        svg: 'assets/icons/megaphone.svg',
    },
};

const declarations = [
    AddressComponent,
    MoneyComponent,
    FocusDirective,
    CardComponent,
    NavigationsComponent,
    CommentComponent,
    TransactionAmountComponent,
    AccountingDocumentsComponent,
    ParticleSwitchComponent,
    SupportComponent,
    IbanPipe,
    CopyContactDataComponent,
];

const imports = [
    ApolloModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NaturalAvatarModule,
    ParticleEffectButtonModule,
    NaturalSearchModule,
    NaturalCommonModule,
    NaturalHierarchicSelectorModule,
    NaturalSidenavModule,
    NaturalSelectModule,
    NaturalRelationsModule,
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalStampModule,
    NaturalDetailHeaderModule,
    NaturalTableButtonModule,
    NaturalFixedButtonModule,
    NaturalFixedButtonDetailModule,
    NaturalDropdownComponentsModule,
    NaturalDialogTriggerModule,
    NaturalFileModule,
    NaturalEditorModule,
];

@NgModule({
    declarations: [...declarations],
    imports: [...imports, NaturalIconModule.forRoot(iconsConfig)],
    exports: [...imports, ...declarations, TimeagoModule, NaturalIconModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IchtusModule {}
