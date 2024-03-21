import {Directive, inject, OnInit} from '@angular/core';
import {UsageBookableService} from '../services/usage-bookable.service';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {
    BookingPartialInput,
    Bookings,
    BookingStatus,
    CurrentUserForProfile,
    UsageBookables,
    User,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {BookableService} from '../services/bookable.service';
import {ExtractTallOne} from '@ecodev/natural/lib/types/types';
import {Observable, of, switchMap} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {availabilityStatus, availabilityText, usageStatus as usageStatusFunc, usageText} from '../bookable';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export const image: AvailableColumn = {id: 'image', label: 'Image'};
export const name: AvailableColumn = {id: 'name', label: 'Nom'};
export const readOnlyName: AvailableColumn = {id: 'readOnlyName', label: 'Nom'};
export const code: AvailableColumn = {id: 'code', label: 'Code'};
export const description: AvailableColumn = {id: 'description', label: 'Description'};
export const price: AvailableColumn = {id: 'price', label: 'Prix'};
export const purchasePrice: AvailableColumn = {id: 'purchasePrice', label: "Prix d'achat"};
export const initialPrice: AvailableColumn = {id: 'initialPrice', label: 'Prix initial'};
export const periodicPrice: AvailableColumn = {id: 'periodicPrice', label: 'Prix périodique'};
export const updateDate: AvailableColumn = {id: 'updateDate', label: 'Dernière modification'};
export const usage: AvailableColumn = {id: 'usage', label: 'Utilisations'};
export const availability: AvailableColumn = {id: 'availability', label: 'Disponibilité'};
export const usageStatus: AvailableColumn = {id: 'usageStatus', label: 'Inscriptions'};
export const verificationDate: AvailableColumn = {id: 'verificationDate', label: 'Dernière vérification'};
export const select: AvailableColumn = {id: 'select', label: 'Sélection', hidden: true};
export const createApplication: AvailableColumn = {id: 'createApplication', label: 'Demander', hidden: true};

type FutureOwner = CurrentUserForProfile['viewer'] | User['user'] | null;

@Directive()
export abstract class ParentComponent<T extends UsageBookableService | BookableService>
    extends NaturalAbstractList<T>
    implements OnInit
{
    protected readonly hasUsage: boolean = false;
    public pendingApplications: Bookings['bookings']['items'][0][] = [];
    public readonly creating = new Map<ExtractTallOne<T>['id'], true>();
    private readonly apollo = inject(Apollo);
    public readonly availabilityStatus = availabilityStatus;
    public readonly availabilityText = availabilityText;
    public readonly usageStatus = usageStatusFunc;
    public readonly usageText = usageText;

    /**
     * The user who will be the owner of the booking when we create it via the `createApplication` button
     */
    public futureOwner: FutureOwner = null;
    public readonly futureOwner$: Observable<FutureOwner> = this.route.data.pipe(
        switchMap(data => {
            // The futureOwner might be specifically given via routing data (for profile page), or we fallback on the user being edited in admin pages
            if (data.futureOwner) {
                return of(data.futureOwner);
            } else if (data.model instanceof Observable) {
                return data.model;
            } else {
                return of(null);
            }
        }),
    );

    protected constructor(
        service: T,
        private readonly bookingService: BookingService,
    ) {
        super(service);

        this.futureOwner$.pipe(takeUntilDestroyed()).subscribe(futureOwner => (this.futureOwner = futureOwner));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.availableColumns = this.availableColumns.length
            ? this.availableColumns
            : [
                  image,
                  ...(this.route.snapshot.data.isAdmin ? [name] : [readOnlyName]),
                  code,
                  description,
                  price,
                  purchasePrice,
                  initialPrice,
                  periodicPrice,
                  updateDate,
                  ...(this.hasUsage ? [usage, availability, usageStatus] : []),
                  verificationDate,
              ];
    }

    /**
     * Create a bookable application attributed to `this.futureOwner`.
     */
    public createApplication(bookable: ExtractTallOne<T>): void {
        if (!this.futureOwner) {
            return;
        }

        this.creating.set(bookable.id, true);
        const booking: BookingPartialInput = {status: BookingStatus.application};
        this.bookingService
            .createWithBookable(bookable, this.futureOwner, booking)
            .pipe(finalize(() => this.creating.delete(bookable.id)))
            .subscribe({
                // It's possible that somebody else took the last spot before we
                // had time to click on the button, so we refresh the list of bookable
                // to show their latest available/complete status
                error: () => this.apollo.client.reFetchObservableQueries(),
            });
    }

    /**
     * Returns true to allow booking if the resource is not already booked or is already booked but not denied for second booking by
     * routing data denyDoubleBooking.
     *
     * This is just ergonomics considerations. API does not deny double booking on specific resources in this case
     */
    public allowBooking(bookable: UsageBookables['bookables']['items'][0]): boolean {
        const alreadyBooked = this.isAlreadyPending(bookable);
        return !!this.futureOwner && (!alreadyBooked || (alreadyBooked && !this.route.snapshot.data.denyDoubleBooking));
    }

    public isAlreadyPending(bookable: UsageBookables['bookables']['items'][0]): boolean {
        return this.pendingApplications.some(applicaton => bookable.id === applicaton.bookable?.id);
    }

    public isFullyBooked(bookable: UsageBookables['bookables']['items'][0]): boolean {
        return this.availabilityStatus(bookable) === 'full';
    }
}
