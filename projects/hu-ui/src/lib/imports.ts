import { HuCard, HuCardActions, HuCardFooter } from './card/card.component';
import { HuDialog, HuDialogFooter } from './dialog/dialog.component';
import { HuFormField, HuPrefix, HuSuffix } from './form-field/form-field.component';
import { HuInput } from './form-field/input.directive';
import { HuShell, HuShellLogo, HuSidebarFooter, HuTopbarEnd, HuTopbarStart } from './layout/shell.component';
import { HuDropdown, HuDropdownHeaderSlot, HuDropdownTrigger } from './dropdown/dropdown.component';
import { HuCellDef, HuTable } from './table/table.component';
import { HuTab, HuTabs } from './tabs/tabs.component';
import { HuStep, HuStepper, HuStepperNext, HuStepperPrevious } from './stepper/stepper.component';

/*
 * Birlikte kullanılan component/directive grupları. Bir parçayı import etmeyi
 * unutmak Angular'da sessizce başarısız olur (öznitelik yok sayılır); gruplar
 * bunu önler.
 *
 * @example imports: [HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS]
 */
export const HU_FORM_FIELD_IMPORTS = [HuFormField, HuInput, HuPrefix, HuSuffix] as const;
export const HU_CARD_IMPORTS = [HuCard, HuCardActions, HuCardFooter] as const;
export const HU_DIALOG_IMPORTS = [HuDialog, HuDialogFooter] as const;
export const HU_DROPDOWN_IMPORTS = [HuDropdown, HuDropdownTrigger, HuDropdownHeaderSlot] as const;
export const HU_TABLE_IMPORTS = [HuTable, HuCellDef] as const;
export const HU_TABS_IMPORTS = [HuTabs, HuTab] as const;
export const HU_STEPPER_IMPORTS = [HuStepper, HuStep, HuStepperNext, HuStepperPrevious] as const;
export const HU_SHELL_IMPORTS = [HuShell, HuTopbarStart, HuTopbarEnd, HuSidebarFooter, HuShellLogo] as const;
