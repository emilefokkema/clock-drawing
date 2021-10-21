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
	class SpringTransition{
		phaseToPosition(phase){
			phase = normalizeToZeroOne(phase);
			return 6.634806 * phase - 11.469158 * phase * phase + 5.834352 * phase * phase * phase;
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
				this.phase = 1;
				this.value = this.targetValue;
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
		}
		draw(context, clock){
			context.translate(this.width / 2, this.height / 2);
			context.scale(this.radius, this.radius);
			this.drawFace(context);
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
			this.drawCase(context);
		}
		drawFace(context){
			context.save();
			const gradient = context.createRadialGradient(0, 0, 0.9, 0, 0, 1.03);
			gradient.addColorStop(0, '#fff');
			gradient.addColorStop(1, '#222');
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(0, 0, 1.05, 0, 2 * Math.PI);
			context.fill();
			context.restore();
		}
		drawCase(context){
			context.save();
			context.globalAlpha = 0.4;
			let gradient = context.createLinearGradient(-0.5, -0.5, 0.5, 0.5);
			gradient.addColorStop(0, 'rgba(150,150,200,0.5)');
			gradient.addColorStop(0.5, '#fff');
			gradient.addColorStop(1, 'rgba(150,150,200,0.5)');
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(0, 0, 1.1, 0, 2 * Math.PI);
			context.fill();
			context.restore();
			context.save();
			gradient = context.createLinearGradient(-1, -1, 1, 1);
			gradient.addColorStop(0, '#009');
			gradient.addColorStop(0.5, '#44e');
			gradient.addColorStop(1, '#009');
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(0, 0, 1.2, 0, 2 * Math.PI);
			context.arc(0, 0, 1.03, 0, 2 * Math.PI);
			context.fill("evenodd");
			context.restore();
		}
		drawMarkers(context){
			context.save();
			for(let i = 0; i < 60; i++){
				if(i % 5 === 0){
					continue;
				}
				const angle = Math.PI * (i / 30 - 0.5);
				context.save();
				context.rotate(angle);
				context.fillRect(0.9, -0.017, 0.1, 0.034);
				context.restore();
			}
			context.lineWidth = 3;
			for(let i = 0; i < 12; i++){
				const angle = Math.PI * (i / 6 - 0.5);
				context.save();
				context.rotate(angle);
				context.fillRect(0.72, -0.03, 0.28, 0.06);
				context.restore();
			}
			context.restore();
		}
		drawSecondHand(context){
			context.save();
			context.fillStyle = '#b00';
			context.save();
			context.shadowOffsetX = 5;
			context.shadowOffsetY = 5;
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0,0,0,0.5)';
			context.beginPath();
			context.arc(0.6, 0, 0.1, 0, 2 * Math.PI);
			context.arc(0.6, 0, 0.05, 0, 2 * Math.PI);
			context.fill("evenodd");
			context.beginPath();
			context.rect(-1, -1, 2, 2);
			context.arc(0.6, 0, 0.075, 0, 2 * Math.PI);
			context.clip("evenodd");
			context.beginPath();
			context.moveTo(-0.3, -0.025);
			context.lineTo(0.95, -0.007);
			context.lineTo(0.95, 0.007);
			context.lineTo(-0.3, 0.025);
			context.fill();
			context.restore();
			context.beginPath();
			context.arc(0.6, 0, 0.1, 0, 2 * Math.PI);
			context.arc(0.6, 0, 0.05, 0, 2 * Math.PI);
			context.fill("evenodd");
			context.restore();
		}
		drawMinuteHand(context){
			context.save();
			context.shadowOffsetX = 5;
			context.shadowOffsetY = 5;
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0,0,0,0.5)';
			context.beginPath();
			context.moveTo(-0.3, -0.035);
			context.lineTo(0.9, -0.035);
			context.lineTo(0.95, 0);
			context.lineTo(0.9, 0.035);
			context.lineTo(-0.3, 0.035);
			context.fill();
			context.restore();
		}
		drawHourHand(context){
			context.save();
			context.shadowOffsetX = 5;
			context.shadowOffsetY = 5;
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0,0,0,0.5)';
			context.beginPath();
			context.moveTo(-0.25, -0.04);
			context.lineTo(0.5, -0.04);
			context.lineTo(0.55, 0);
			context.lineTo(0.5, 0.04);
			context.lineTo(-0.25, 0.04);
			context.fill();
			context.restore();
		}
	}
	class Clock{
		constructor(){
			this.secondHandTransitioningValue = new TransitioningValue(new SineTransition(), 0.001, 2 * Math.PI);
			this.minuteHandTransitioningValue = new TransitioningValue(new SpringTransition(), 0.006, 2 * Math.PI);
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
			let phaseOfMinute = numberOfMillisecondsInMinute < 58500 ? numberOfMillisecondsInMinute / 58500 : 1;
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