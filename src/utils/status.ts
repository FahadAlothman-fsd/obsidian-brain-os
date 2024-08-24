import type BrainOS from "../main";

import { PROJECT, RESOURCE } from '../constants';
import type { statusType } from "../types/paraTypes";
import type { BrainSettings } from "../types";

// From https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Statuses/StatusConfiguration.ts
export enum StatusType {
  // Backlog
  NEW = "NEW",
  // Active
  IN_PROGRESS = "IN_PROGRESS",
  POST_PROCESSING = "POST_PROCESSING",
  // Archive
  DONE = "DONE",
  ON_HOLD = "ON_HOLD",
  CANCELLED = "CANCELLED",
  IRRELEVANT = "IRRELEVANT", // Resource/Area
}





/**
 * This is the object stored by the Obsidian configuration and used to create the status
 * objects for the session
 *
 * From https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Statuses/StatusConfiguration.ts
 *
 * @export
 * @class StatusConfiguration
 */
export class StatusConfiguration {

  /**
   * Returns the name of the status for display purposes.
   *
   * @type {string}
   * @memberof Status
   */
  public readonly name: string;


  /**
   * Returns the name of the status for display purposes.
   *
   * @type {boolean}
   */
  public readonly default_status: boolean;


  /**
   * Returns the name of the status for display purposes.
   *
   * @type {string}
   */
  public readonly id: string;

  // TODO: might need to add this in the future when there are workflow related statuses
  // in the tasks plugin, its used when clicking on the task 
  // /**
  //  * Returns the next status for a task when toggled.
  //  *
  //  * @type {string}
  //  * @memberof Status
  //  */
  // public readonly nextStatusSymbol: string;

  // /**
  //  * If true then it is registered as a command that the user can map to.
  //  *
  //  * @type {boolean}
  //  * @memberof Status
  //  */
  // public readonly availableAsCommand: boolean;

  /**
   * Returns the status type. See {@link StatusType} for details.
   */
  public readonly type: StatusType;

  /**
   * Creates an instance of Status. The registry will be added later in the case
   * of the default statuses.
   *
   * @param {string} name
   * @param {StatusType} type
   * @param {boolean} type
   * @memberof Status
   */
  constructor(
    name: string,
    // availableAsCommand: boolean,
    type: StatusType = StatusType.NEW, // TODO Remove default value
    default_status: boolean = false
  ) {
    this.name = name;
    // this.availableAsCommand = availableAsCommand;
    this.type = type;
    this.default_status = default_status
    this.id = `${this.name.toLowerCase().replace(' ', '_')}-${this.type}`
  }
}





/**
 * Tracks the possible states that a task can be in.
 *
 * Related classes:
 * @see StatusConfiguration
 * @see CustomStatusModal
 *
 * @export
 * @class Status
 */
export class Status {


  /**
   * The default Done status. Goes to Todo when toggled.
   *
   * @static
   * @type {Status}
   * @memberof Status
   */
  public static DONE: Status = Status.makeDone();


  /**
   * The default Irrelevant status. 
   *
   * @static
   * @type {Status}
   * @memberof Status
   */
  public static IRRELEVANT: Status = Status.makeIrrelevant();

  /**
   * The default New status. 
   * User may later be able to override this to go to In Progress instead.
   *
   * @static
   * @type {Status}
   * @memberof Status
   */
  public static TODO: Status = Status.makeNew();

  /**
   * The configuration stored in the data.json file.
   *
   * @type {StatusConfiguration}
   * @memberof Status
   */
  public readonly configuration: StatusConfiguration;

  // /**
  //  * The symbol used between the two square brackets in the markdown task.
  //  *
  //  * @type {string}
  //  * @memberof Status
  //  */
  // public get symbol(): string {
  //     return this.configuration.symbol;
  // }


  /**
   * Returns the name of the status for display purposes.
   *
   * @type {string}
   * @memberof Status
   */
  public get id(): string {
    return this.configuration.id;
  }

  /**
   * Returns the name of the status for display purposes.
   *
   * @type {string}
   * @memberof Status
   */
  public get name(): string {
    return this.configuration.name;
  }


  public get default_status(): boolean {
    return this.configuration.default_status;
  }

  // /**
  //  * Returns the next status for a task when toggled.
  //  *
  //  * @type {string}
  //  * @memberof Status
  //  * @see nextSymbol
  //  */
  // public get nextStatusSymbol(): string {
  //     return this.configuration.nextStatusSymbol;
  // }

  // /**
  //  * Returns the next status for a task when toggled.
  //  * This is an alias for {@link nextStatusSymbol} which is provided for brevity in user scripts.
  //  *
  //  * @type {string}
  //  * @memberof Status
  //  * @see nextStatusSymbol
  //  */
  // public get nextSymbol(): string {
  //     return this.configuration.nextStatusSymbol;
  // }
  //


  /**
   * Returns the status type. See {@link StatusType} for details.
   */
  public get type(): StatusType {
    return this.configuration.type;
  }

  /**
   * Returns the text to be used to represent the {@link StatusType} in group headings.
   *
   * The status types are in the same order as given by 'group by status.type'.
   * This is provided as a convenience for use in custom grouping.
   */
  public get typeGroupText(): string {
    const type = this.type;
    let prefix: string;
    // Add a numeric prefix to sort in to a meaningful order for users
    switch (type) {
      case StatusType.NEW:
        prefix = '1'
        break;
      case StatusType.IN_PROGRESS:
        prefix = '2';
        break;
      case StatusType.POST_PROCESSING:
        prefix = '3';
        break;
      case StatusType.DONE:
        prefix = '4';
        break;
      case StatusType.ON_HOLD:
        prefix = '5';
        break;
      case StatusType.CANCELLED:
        prefix = '6';
        break;
      case StatusType.IRRELEVANT:
        prefix = '7';
        break;

    }
    // Text inside the %%..%% comments is used to control the sorting in both sorting of tasks and naming of groups.
    // The comments are hidden by Obsidian when the headings are rendered.
    return `%%${prefix}%%${type}`;
  }

  /**
   * Creates an instance of Status. The registry will be added later in the case
   * of the default statuses.
   *
   * @param {StatusConfiguration} configuration
   * @memberof Status
   */
  constructor(configuration: StatusConfiguration) {
    this.configuration = configuration;
  }

  /**
   * The default NEW status. 
   */
  static makeNew(): Status {
    return new Status(new StatusConfiguration('New', StatusType.NEW));
  }


  /**
   * The default Done status. Goes to Todo when toggled.
   */
  static makeDefault(settings: BrainSettings, type: typeof PROJECT | typeof RESOURCE): Status {
    let default_status: statusType | undefined
    if (type === PROJECT) {

      default_status = settings.para.projects.project_statuses.find((stat) => stat.default)
    }
    if (default_status !== undefined) {
      return new Status(new StatusConfiguration(default_status.name, default_status.type, default_status.default));

    }
    return new Status(new StatusConfiguration('', StatusType.DONE));
  }

  /**
   * The default Done status. Goes to Todo when toggled.
   */
  static makeDone(): Status {
    return new Status(new StatusConfiguration('Done', StatusType.DONE));
  }



  /**
   * The default Cancelled status. Goes to Todo when toggled.
   */
  static makeCancelled(): Status {
    return new Status(new StatusConfiguration('Cancelled', StatusType.CANCELLED));
  }

  /**
   * The default In Progress status. Goes to Done when toggled.
   */
  static makeInProgress(): Status {
    return new Status(new StatusConfiguration('In Progress', StatusType.IN_PROGRESS));
  }


  /**
   * The default NEW status. 
   */
  static makeIrrelevant(): Status {
    return new Status(new StatusConfiguration('Irrelevant', StatusType.IRRELEVANT));
  }

  /**
   * Convert text that was saved from a StatusType value back to a StatusType.
   * Returns StatusType.TODO if the string is not valid.
   * @param statusTypeAsString
   */
  static getTypeFromStatusTypeString(statusTypeAsString: string): StatusType {
    return StatusType[statusTypeAsString as keyof typeof StatusType] || StatusType.NEW;
  }




  /**
   * Whether the task status type is {@link CANCELLED}.
   */
  public isCancelled(): boolean {
    return this.type === StatusType.CANCELLED;
  }

  /**
   * Compare all the fields in another Status, to detect any differences from this one.
   *
   * If any field is different in any way, it will return false.
   *
   * @param other
   */
  public identicalTo(other: Status): boolean {
    const args: Array<keyof StatusConfiguration> = [
      'name',
      'type',
      'default_status',
    ];
    for (const el of args) {
      if (this[el] !== other[el]) return false;
    }
    return true;
  }

  /**
   * Return a one-line summary of the status, for presentation to users.
   */
  public previewText() {
    return (
      ` name: '${this.name}',` +
      ` type: '${this.configuration.type}'.`
    );
  }

}



export class StatusValidator {
  /**
   * Determine whether the date in this object is valid, and return error message(s) for display if not.
   */
  public validate(plugin: BrainOS, statusConfiguration: StatusConfiguration, type: typeof PROJECT | typeof RESOURCE, original: StatusConfiguration): string[] {
    const errors: string[] = [];

    // Messages are added in the order fields are shown when editing statuses.
    errors.push(...this.validateName(statusConfiguration));
    errors.push(...this.validateType(statusConfiguration.type))
    errors.push(...this.validateDefault(plugin, statusConfiguration, type, original))

    return errors;
  }

  /**
   * Validate data in StatusCollection lists. These are the descriptions of statuses in various themes,
   * that are imported via one-click buttons in the Custom Status settings.
   *
   * This does a few checks to guard against human error when creating the lists, and then
   * also calls {@link validate} too.
   * @param entry
   */
  public validateStatusCollectionEntry(entry: StatusCollectionEntry) {
    const [_name, typeAsString] = entry;

    const errors: string[] = [];

    // Checks that can only be done on the raw data.
    // Status.createFromImportedValue() falls back to StatusType.TODO if the
    // type string is not recognised, so we have to test that first.
    errors.push(...this.validateType(typeAsString));


    // If the raw data was not valid, return now, to avoid potentially misleading
    // errors from later checks.
    if (errors.length > 0) {
      return errors;
    }


    return errors;
  }



  public validateName(statusConfiguration: StatusConfiguration) {
    const errors: string[] = [];
    if (statusConfiguration.name.length === 0) {
      errors.push('Status Name cannot be empty.');
    }
    return errors;
  }

  public validateType(symbolName: string): string[] {
    const statusTypeElement = StatusType[symbolName as keyof typeof StatusType];
    const errors: string[] = [];
    if (!statusTypeElement) {
      errors.push(`Status Type "${symbolName}" is not a valid type`);
    }
    return errors;
  }

  public validateDefault(plugin: BrainOS, statusConfiguration: StatusConfiguration, type: typeof PROJECT | typeof RESOURCE, original: StatusConfiguration) {
    const errors: string[] = [];
    let statuses: statusType[] = []
    if (type === PROJECT) {
      statuses = plugin.settings.para.projects.project_statuses
    } else if (type === RESOURCE) {
      statuses = plugin.settings.para.resources.resource_statuses

    }
    const exisitingDefault = statuses.find((val) => val.default && val.id !== original.id)
    if (exisitingDefault && statusConfiguration.default_status) {
      errors.push(`${statusConfiguration.name} cannot be the default, as ${exisitingDefault.name} is already the default ${type.toLowerCase()} status`)

    }
    if (statusConfiguration.type !== StatusType.NEW && statusConfiguration.default_status) {

      errors.push(`Statuses of type ${statusConfiguration.type} CANNOT be the default\nonly statuses of type ${StatusType.NEW} can be the default status`)
    }
    return errors
  }


}

/**
 * The type used for a single entry in bulk imports of pre-created sets of statuses, such as for Themes or CSS Snippets.
 * The values are: symbol, name, next symbol, status type (must be one of the values in {@link StatusType}
 */
export type StatusCollectionEntry = [string, string];

/**
 * The type used for bulk imports of pre-created sets of statuses, such as for Themes or CSS Snippets.
 * See {@link Status.createFromImportedValue}
 */
export type StatusCollection = Array<StatusCollectionEntry>;
