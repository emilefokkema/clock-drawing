(function(){
	class ClockUI{
		constructor(width, height){
			this.width = width;
			this.height = height;
			this.radius = Math.min(width / 2, height / 2) * 0.7;
			this.secondHandLength = this.radius * 0.9;
			this.minuteHandLength = this.radius * 0.8;
			this.hourHandLength = this.radius / 2;
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
				context.beginPath();
				context.moveTo(this.radius * 0.9, 0);
				context.lineTo(this.radius, 0);
				context.stroke();
				context.restore();
			}
			context.lineWidth = 3;
			for(let i = 0; i < 12; i++){
				const angle = Math.PI * (i / 6 - 0.5);
				context.save();
				context.rotate(angle);
				context.beginPath();
				context.moveTo(this.radius * 0.8, 0);
				context.lineTo(this.radius, 0);
				context.stroke();
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
			this.secondHandAngle = 0;
			this.minuteHandAngle = 0;
			this.hourHandAngle = 0;
		}
		update(){
			const date = new Date();
			const seconds = date.getSeconds();
			const minutes = date.getMinutes();
			const hours = date.getHours() % 12;
			this.secondHandAngle = Math.PI * (seconds - 15) / 30;
			this.minuteHandAngle = Math.PI * (minutes / 30 + seconds / 1800 - 0.5);
			this.hourHandAngle = Math.PI * (hours / 6 + minutes / 360 + seconds / 21600 - 0.5);
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

	var draw = function(){
		clock.update();
		canvas.width = width;
		context.restore();
		context.save();
		clockUi.draw(context, clock);
	}

	var animate = function(){
		requestAnimationFrame(() => {
			draw();
			animate();
		});
	};

	animate();
})()