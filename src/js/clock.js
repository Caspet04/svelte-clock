// TODO: Refactor and add getter for alarm
export class Clock {
    constructor() {
        this._time = {
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        }
        this._alarm = {
            hour: null,
            minute: null,
            second: null,
            active: false,
            triggered: false
        }
        this.timezone = null;
    }

    get timeAsString() {
        return this._time.hour.toString().padStart(2, '0') + ':' + this._time.minute.toString().padStart(2, '0') + ':' + this._time.second.toString().padStart(2, '0');
    }

    get alarmTimeAsString() {
        if (!this._alarm.hour || !this._alarm.minute) {
            return null;
        }
        return this._alarm.hour.toString().padStart(2, '0') + ':' + this._alarm.minute.toString().padStart(2, '0') + ':' + this._alarm.second.toString().padStart(2, '0');
    }

    // Takes in a string in the format '{hour}:{minute}'
    set alarmTimeAsString(string) {
        let parts = string.split(':');
        this._alarm = {
            hour: parts[0], // Takes the leftmost element to 
            minute: parts[1],
            second: parts.length > 2 ? parts[2] : 0,
            active: this._alarm.active,
            triggered: false
        }
    }

    get alarmIsTriggered() {
        if (!this._alarm.active)
            return false;
        
        return this._alarm.triggered;
    }

    set alarmIsTriggered(bool) {
        this._alarm.triggered = bool;
    }

    get alarmIsActive() {
        return this._alarm.active;
    }

    set alarmIsActive(bool) {
        this._alarm.triggered = false;
        this._alarm.active = bool;
    }
    
    // Getters for the time elements
    get second() { return this._time.second; }
    get minute() { return this._time.minute; }
    get hour()   { return this._time.hour;   }

    // Getter for the alarm time elements
    get alarmSecond() { return this._alarm.second; }
    get alarmMinute() { return this._alarm.minute; }
    get alarmHour()   { return this._alarm.hour;   }

    syncTime() {
        // Set time to the current local time
        var today = new Date();

        this._time.millisecond = today.getMilliseconds();
        this._time.second      = today.getSeconds();
        this._time.minute      = today.getMinutes();
        this._time.hour        = today.getHours();

        if (this.timezone != null) {
            this._time.hour += Math.floor(this.timezone);
            this._time.minute += this.timezone % 1 * 60;
        }

    }

    tick(useMilli=false) {
        // Increment second, minute and hour. Increment millisecond if option is passed
        this._time.millisecond += useMilli ? 1 : 0;
        this._time.second      += useMilli ? (this._time.millisecond >= 1000 ? 1 : 0) : 1;
        this._time.minute      += this._time.second >= 60 ? 1 : 0;
        this._time.hour        += this._time.minute >= 60 ? 1 : 0;

        // Prevent overflow of the time values
        this._time.millisecond %= 1000;
        this._time.second      %= 60;
        this._time.minute      %= 60;
        this._time.hour        %= 24;
    }

    updateAlarm() {
        // Test if alarm is triggered
        if (this._time.hour   == this._alarm.hour   &&
            this._time.minute == this._alarm.minute &&
            this._time.second == this._alarm.second) {
            
            this._alarm.triggered = true;
        }
    }

    setAlarm(hour, minute, second) {
        this._alarm = {
            hour,
            minute,
            second,
            active: true,
            triggered: false
        }
    }

    toggleAlarm() {
        if (!this._alarm.hour || !this._alarm.minute) {
            return null;
        }
        this.alarmIsActive = !this.alarmIsActive;
    }

    getDigit(index) {
        switch(index) {
            case 0:
                return Math.floor(this.hour / 10);
            case 1:
                return this.hour % 10;
            case 2:
                return Math.floor(this.minute / 10);
            case 3:
                return this.minute % 10;
            case 4:
                return Math.floor(this.second / 10);
            case 5:
                return this.second % 10;
        }
    }
}