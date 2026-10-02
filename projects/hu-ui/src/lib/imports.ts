import { HuCard, HuCardActions, HuCardFooter, HuCardMedia } from './card/card.component';
import { HuDialog, HuDialogFooter } from './dialog/dialog.component';
import { HuFormField, HuPrefix, HuSuffix } from './form-field/form-field.component';
import { HuInput } from './form-field/input.directive';
import { HuShell, HuShellLogo, HuSidebarFooter, HuTopbarEnd, HuTopbarStart } from './layout/shell.component';
import { HuDropdown, HuDropdownHeaderSlot, HuDropdownTrigger } from './dropdown/dropdown.component';
import { HuCellDef, HuRowDetail, HuTable, HuTableBulkActions, HuTableToolbar } from './table/table.component';
import { HuTab, HuTabs } from './tabs/tabs.component';
import { HuRadio, HuRadioGroup } from './radio/radio.component';
import { HuStep, HuStepper, HuStepperNext, HuStepperPrevious } from './stepper/stepper.component';
import { HuAccordion, HuAccordionPanel } from './panel/accordion.component';
import { HuTimeline, HuTimelineContent, HuTimelineMarker, HuTimelineOpposite } from './data/timeline.component';
import { HuTree, HuTreeNodeDef } from './data/tree.component';
import { HuPickList, HuPickListItem } from './data/picklist.component';
import { HuOrgChart, HuOrgChartNodeDef } from './data/org-chart.component';
import { HuCarousel, HuCarouselItem } from './media/carousel.component';

/*
 * Birlikte kullanılan component/directive grupları. Bir parçayı import etmeyi
 * unutmak Angular'da sessizce başarısız olur (öznitelik yok sayılır); gruplar
 * bunu önler.
 *
 * @example imports: [HU_FORM_FIELD_IMPORTS, HU_TABLE_IMPORTS]
 */
export const HU_FORM_FIELD_IMPORTS = [HuFormField, HuInput, HuPrefix, HuSuffix] as const;
export const HU_CARD_IMPORTS = [HuCard, HuCardActions, HuCardFooter, HuCardMedia] as const;
export const HU_DIALOG_IMPORTS = [HuDialog, HuDialogFooter] as const;
export const HU_DROPDOWN_IMPORTS = [HuDropdown, HuDropdownTrigger, HuDropdownHeaderSlot] as const;
export const HU_TABLE_IMPORTS = [HuTable, HuCellDef, HuRowDetail, HuTableToolbar, HuTableBulkActions] as const;
export const HU_TABS_IMPORTS = [HuTabs, HuTab] as const;
export const HU_RADIO_IMPORTS = [HuRadioGroup, HuRadio] as const;
export const HU_STEPPER_IMPORTS = [HuStepper, HuStep, HuStepperNext, HuStepperPrevious] as const;
export const HU_SHELL_IMPORTS = [HuShell, HuTopbarStart, HuTopbarEnd, HuSidebarFooter, HuShellLogo] as const;
export const HU_ACCORDION_IMPORTS = [HuAccordion, HuAccordionPanel] as const;
export const HU_TIMELINE_IMPORTS = [HuTimeline, HuTimelineContent, HuTimelineOpposite, HuTimelineMarker] as const;
export const HU_TREE_IMPORTS = [HuTree, HuTreeNodeDef] as const;
export const HU_PICKLIST_IMPORTS = [HuPickList, HuPickListItem] as const;
export const HU_ORG_CHART_IMPORTS = [HuOrgChart, HuOrgChartNodeDef] as const;
export const HU_CAROUSEL_IMPORTS = [HuCarousel, HuCarouselItem] as const;
