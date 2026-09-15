import "server-only";

/**
 * Capa de acceso a datos.
 * Las páginas, layouts y server actions importan desde aquí, no desde Prisma directo
 * salvo casos internos (auth).
 */
export { prisma } from "@/lib/db";
export { getSalonContent, updateSalonSettingsRecord } from "@/lib/data/salon";
export {
  getDisplayHours,
  getPublicProfessionals,
  getPublicServices,
} from "@/lib/data/catalog";
export {
  createServiceRecord,
  deleteServiceIfSafe,
  getAdminService,
  listAdminServices,
  setServiceActiveRecord,
  updateServiceRecord,
} from "@/lib/data/services";
export {
  createProfessionalRecord,
  deleteProfessionalIfSafe,
  getAdminProfessional,
  listAdminProfessionals,
  setProfessionalActiveRecord,
  updateProfessionalRecord,
} from "@/lib/data/professionals";
export { getCompatibleProfessionals, listAvailableSlots } from "@/lib/data/availability";
export { createPublicBooking, getBookingByCode } from "@/lib/data/booking";
export {
  getAdminAppointment,
  listAdminAppointments,
  listCalendarAppointments,
  rescheduleAppointmentRecord,
  setAppointmentStatusRecord,
} from "@/lib/data/appointments";
export {
  createSaleRecord,
  getAdminCustomer,
  listAdminCustomers,
  upsertCustomerRecord,
} from "@/lib/data/customers";
export {
  createBlockedTimeRecord,
  deleteBlockedTimeRecord,
  listBlockedTimes,
  listBusinessHours,
  saveBusinessHoursRecord,
} from "@/lib/data/hours";
