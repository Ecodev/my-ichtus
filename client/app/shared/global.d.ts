type AppChronos = string;
type AppColor = string;
type AppDate = string;
type AppEmail = string;
type AppLogin = string;
type AppMoney = string;
type AppPassword = string;
type AppToken = string;
type AppUpload = File;

// All IDs
// Ideally we should not use `any` at all, but we want to be able
// to use either a string or an entire subobject.
type AppAccountingDocumentID = string | any;
type AppAccountID = string | any;
type AppBookableMetadataID = string | any;
type AppBookableID = string | any;
type AppBookableTagID = string | any;
type AppBookingID = string | any;
type AppCountryID = string | any;
type AppExpenseClaimID = string | any;
type AppImageID = string | any;
type AppLicenseID = string | any;
type AppMessageID = string | any;
type AppTransactionLineID = string | any;
type AppTransactionID = string | any;
type AppTransactionTagID = string | any;
type AppUserID = string | any;
type AppUserTagID = string | any;
