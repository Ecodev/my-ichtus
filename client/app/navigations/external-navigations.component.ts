import {type AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewEncapsulation} from '@angular/core';
// Those import have side effects and loading order might be important
import {$, load} from './general/home';
import {historyBackTab, newTab} from './general/screen';

// Those imports have no side effects
import {changeSelectCategorie, clickSortIcon} from './equipment/elements';
import {Requests, serverInitialize} from './general/server-requests';
import {Cahier} from './cahier/methods';
import {checkInfos, focusInOrOut, writeDestination, writeNbrInvites} from './infos/infos';
import {bookingTableSearch, newBookingTable} from './cahier/cahier';
import {popLogin} from './member/login';
import {UserForVanillaService} from './user-for-vanilla.service';
import {BookableForVanillaService} from './bookable-for-vanilla.service';
import {BookingForVanillaService} from './booking-for-vanilla.service';
import type {Literal} from '@ecodev/natural';

@Component({
    selector: 'app-external-navigations',
    templateUrl: './external-navigations.component.html',
    styleUrls: [
        './general/general.css',
        './general/pop-alert.css',
        './page/top.css',
        './page/bottom.css',
        './page/pop-stats.css',
        './cahier/cahier.css',
        './cahier/top.css',
        './cahier/top-list.css',
        './member/user.css',
        './member/member.css',
        './member/login.css',
        './equipment/choice.css',
        './equipment/categories.css',
        './equipment/elements.css',
        './equipment/pop-bookable.css',
        './equipment/pop-bookable-history.css',
        './infos/infos.css',
        './infos/pop-infos.css',
        './confirmation/confirmation.css',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
})
export class ExternalNavigationsComponent implements AfterViewInit {
    private readonly userService = inject(UserForVanillaService);
    private readonly bookableService = inject(BookableForVanillaService);
    private readonly bookingService = inject(BookingForVanillaService);

    public ngAfterViewInit(): void {
        // To be able to access those in native event binding
        const myWindow = window as Literal;
        myWindow.$ = $;
        myWindow.changeSelectCategorie = changeSelectCategorie;
        myWindow.Requests = Requests;
        myWindow.Cahier = Cahier;
        myWindow.checkInfos = checkInfos;
        myWindow.clickSortIcon = clickSortIcon;
        myWindow.historyBackTab = historyBackTab;
        myWindow.newTab = newTab;
        myWindow.newBookingTable = newBookingTable;
        myWindow.popLogin = popLogin;
        myWindow.writeNbrInvites = writeNbrInvites;
        myWindow.focusInOrOut = focusInOrOut;
        myWindow.writeDestination = writeDestination;
        myWindow.bookingTableSearch = bookingTableSearch;

        serverInitialize({
            userService: this.userService,
            bookableService: this.bookableService,
            bookingService: this.bookingService,
        });

        load();
    }
}
