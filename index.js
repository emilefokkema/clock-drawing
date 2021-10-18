(function(){
	function findClosestValue(currentValue, referenceValue, period){
		if(currentValue >= referenceValue){
			const boundary = referenceValue + period / 2;
			while(currentValue > boundary){
				currentValue -= period;
			}
			return currentValue;
		}else{
			const boundary = referenceValue - period / 2;
			while(currentValue < boundary){
				currentValue += period;
			}
			return currentValue;
		}
	}
	function normalizeToZeroOne(value){
		if(value < 0){
			return 0;
		}
		if(value > 1){
			return 1;
		}
		return value;
	}
	class SineTransition{
		phaseToPosition(phase){
			phase = normalizeToZeroOne(phase);
			return (1 + Math.sin((phase - 0.5) * Math.PI)) / 2;
		}
	}
	class TransitioningValue{
		constructor(transition, speed, period){
			this.transition = transition;
			this.speed = speed;
			this.period = period;
			this.reset(0);
		}
		reset(value){
			this.value = value;
			this.phase = 0;
			this.previousTargetValue = value;
			this.targetValue = value;
			this.latestTimeStamp = 0;
		}
		update(targetValue, timeStamp){
			if(targetValue !== this.targetValue){
				let startingValue = this.targetValue;
				if(this.period !== undefined){
					startingValue = findClosestValue(startingValue, targetValue, this.period);
				}
				this.previousTargetValue = startingValue;
				this.value = startingValue;
				this.targetValue = targetValue;
				this.phase = 0;
			}
			let timeDifference = timeStamp - this.latestTimeStamp;
			if(timeDifference > 1000){
				timeDifference = 0;
			}
			this.latestTimeStamp = timeStamp;
			this.phase = normalizeToZeroOne(this.phase + timeDifference * this.speed);
			this.value = this.previousTargetValue + this.transition.phaseToPosition(this.phase) * (this.targetValue - this.previousTargetValue);
		}
	}
	class ClockUI{
		constructor(width, height){
			this.width = width;
			this.height = height;
			this.radius = Math.min(width / 2, height / 2) * 0.7;
			this.secondHandLength = this.radius * 0.9;
			this.minuteHandLength = this.radius * 0.8;
			this.hourHandLength = this.radius / 2;
			this.smallMarkerWidth = this.radius / 20;
			this.smallMarkerHeight = this.radius / 30;
			this.bigMarkerWidth = this.radius / 7;
			this.bigMarkerHeight = this.radius / 20;
		}
		draw(context, clock){
			context.translate(this.width / 2, this.height / 2);
			context.lineWidth = 2;
			context.beginPath();
			context.arc(0, 0, this.radius, 0, 2 * Math.PI);
			context.stroke();
			this.drawMarkers(context);
			context.save();
			context.rotate(clock.hourHandAngle);
			this.drawHourHand(context);
			context.restore();
			context.save();
			context.rotate(clock.minuteHandAngle);
			this.drawMinuteHand(context);
			context.restore();
			context.save();
			context.rotate(clock.secondHandAngle);
			this.drawSecondHand(context);
			context.restore();
		}
		drawMarkers(context){
			context.save();
			context.lineWidth = 1;
			for(let i = 0; i < 60; i++){
				if(i % 5 === 0){
					continue;
				}
				const angle = Math.PI * (i / 30 - 0.5);
				context.save();
				context.rotate(angle);
				context.fillRect(this.radius - this.smallMarkerWidth, -this.smallMarkerHeight / 2, this.smallMarkerWidth, this.smallMarkerHeight);
				context.restore();
			}
			context.lineWidth = 3;
			for(let i = 0; i < 12; i++){
				const angle = Math.PI * (i / 6 - 0.5);
				context.save();
				context.rotate(angle);
				context.fillRect(this.radius - this.bigMarkerWidth, -this.bigMarkerHeight / 2, this.bigMarkerWidth, this.bigMarkerHeight);
				context.restore();
			}
			context.restore();
		}
		drawSecondHand(context){
			context.fillRect(0, -2, this.secondHandLength, 4);
		}
		drawMinuteHand(context){
			context.fillRect(0, -3, this.minuteHandLength, 6);
		}
		drawHourHand(context){
			context.fillRect(0, -3, this.hourHandLength, 6);
		}
	}
	class Clock{
		constructor(){
			this.secondHandTransitioningValue = new TransitioningValue(new SineTransition(), 0.001, 2 * Math.PI);
			this.minuteHandTransitioningValue = new TransitioningValue(new SineTransition(), 0.001, 2 * Math.PI);
			this.secondHandAngle = 0;
			this.minuteHandAngle = 0;
			this.hourHandAngle = 0;
		}
		reset(date){
			const {secondHandTargetAngle, minuteHandTargetAngle, hourHandTargetAngle} = this.getAngles(date);
			this.secondHandTransitioningValue.reset(secondHandTargetAngle);
			this.minuteHandTransitioningValue.reset(minuteHandTargetAngle);
			this.secondHandAngle = this.secondHandTransitioningValue.value;
			this.minuteHandAngle = this.minuteHandTransitioningValue.value;
			this.hourHandAngle = hourHandTargetAngle;
		}
		getAngles(date){
			const seconds = date.getSeconds();
			const milliseconds = date.getMilliseconds();
			const numberOfMillisecondsInMinute = seconds * 1000 + milliseconds;
			let phaseOfMinute = numberOfMillisecondsInMinute < 750 ? 0 : (numberOfMillisecondsInMinute > 59250 ? 1 : (numberOfMillisecondsInMinute - 750) / 58500);
			phaseOfMinute = Math.floor(60 * phaseOfMinute) / 60;
			const minutes = date.getMinutes();
			const hours = date.getHours() % 12;
			const secondHandTargetAngle = Math.PI * (2 * phaseOfMinute - 0.5);
			const minuteHandTargetAngle = Math.PI * (minutes / 30 - 0.5);
			const hourHandTargetAngle = Math.PI * (hours / 6 + minutes / 360 + seconds / 21600- 0.5);
			return {secondHandTargetAngle, minuteHandTargetAngle, hourHandTargetAngle};
		}
		update(timeStamp){
			const date = new Date();
			const {secondHandTargetAngle, minuteHandTargetAngle, hourHandTargetAngle} = this.getAngles(date);
			this.secondHandTransitioningValue.update(secondHandTargetAngle, timeStamp);
			this.minuteHandTransitioningValue.update(minuteHandTargetAngle, timeStamp);
			this.secondHandAngle = this.secondHandTransitioningValue.value;
			this.minuteHandAngle = this.minuteHandTransitioningValue.value;
			this.hourHandAngle = hourHandTargetAngle;
		}
	}
	var canvas = document.getElementById('canvas');
	var rect = canvas.getBoundingClientRect();
	var width = rect.width;
	var height = rect.height;
	canvas.width = width;
	canvas.height = height;
	var context = canvas.getContext("2d");

	var clockUi = new ClockUI(width, height);
	var clock = new Clock();
	clock.reset(new Date());

	var draw = function(timeStamp){
		clock.update(timeStamp);
		canvas.width = width;
		context.restore();
		context.save();
		clockUi.draw(context, clock);
	}

	var animate = function(){
		requestAnimationFrame(timeStamp => {
			draw(timeStamp);
			animate();
		});
	};

	animate();
})()