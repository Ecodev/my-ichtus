import {Directive, Injector, OnInit} from '@angular/core';
import {UsageBookableService} from '../services/usage-bookable.service';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {
    BookingPartialInput,
    Bookings_bookings_items,
    BookingStatus,
    UsageBookables_bookables_items,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {BookableService} from '../services/bookable.service';
import {ExtractTallOne} from '@ecodev/natural/lib/types/types';
import {UserResolve} from '../../users/user';
import {ViewerResolve} from '../../users/services/viewer.resolver';
import {map, Observable, takeUntil} from 'rxjs';
import {finalize} from 'rxjs/operators';

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
export const usageNb: AvailableColumn = {id: 'usageNb', label: 'Disponibilité'};
export const verificationDate: AvailableColumn = {id: 'verificationDate', label: 'Dernière vérification'};
export const select: AvailableColumn = {id: 'select', label: 'Sélection', hidden: true};
export const createApplication: AvailableColumn = {id: 'createApplication', label: 'Demander', hidden: true};

type FutureOwner = ViewerResolve['model'] | UserResolve['model'] | null;

@Directive()
export abstract class ParentComponent<T extends UsageBookableService | BookableService>
    extends NaturalAbstractList<T>
    implements OnInit
{
    protected readonly hasUsage: boolean = false;
    public readonly UsageBookableService = UsageBookableService;
    public pendingApplications: Bookings_bookings_items[] = [];
    public readonly creating = new Map<ExtractTallOne<T>['id'], true>();

    /**
     * The user who will be the owner of the booking when we create it via the `createApplication` button
     */
    public futureOwner: FutureOwner = null;
    public readonly futureOwner$: Observable<FutureOwner> = this.route.data.pipe(
        map(data => {
            // The futureOwner might be specifically given via routing data (for profile page), or we fallback on the user being edited in admin pages
            return data.futureOwner?.model ?? data.user?.model ?? null;
        }),
    );

    protected constructor(service: T, injector: Injector, private readonly bookingService: BookingService) {
        super(service, injector);

        this.futureOwner$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(futureOwner => (this.futureOwner = futureOwner));
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
                  ...(this.hasUsage ? [usage, usageNb] : []),
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
            .subscribe();
    }

    /**
     * Returns true to allow booking if the resource is not already booked or is already booked but not denied for second booking by
     * routing data denyDoubleBooking.
     *
     * This is just ergonomics considerations. API does not deny double booking on specific resources in this case
     */
    public allowBooking(
        bookable: UsageBookables_bookables_items,
        pendingApplications: Bookings_bookings_items[],
    ): boolean {
        const alreadyBooked = UsageBookableService.isAlreadyPending(bookable, pendingApplications);
        return !!this.futureOwner && (!alreadyBooked || (alreadyBooked && !this.route.snapshot.data.denyDoubleBooking));
    }
}
