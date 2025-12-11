#!/usr/bin/env python3
"""
CLI Management Tool for Political Data Microservice
"""

import asyncio
import json
import click
import aiohttp
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.live import Live
from datetime import datetime

console = Console()

@click.group()
def cli():
    """Political Data Microservice Management CLI"""
    pass

@cli.command()
@click.option('--host', default='localhost', help='Service host')
@click.option('--port', default=8000, help='Service port')
def status(host, port):
    """Check service status"""
    async def check_status():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f'http://{host}:{port}/health') as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        console.print("✅ [green]Service is healthy[/green]")
                        console.print(f"   Timestamp: {data['timestamp']}")
                    else:
                        console.print("❌ [red]Service is unhealthy[/red]")
        except Exception as e:
            console.print(f"❌ [red]Connection failed: {e}[/red]")
    
    asyncio.run(check_status())

@cli.command()
@click.option('--host', default='localhost', help='Service host')
@click.option('--port', default=8000, help='Service port')
def stats(host, port):
    """Show real-time statistics"""
    async def show_stats():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f'http://{host}:{port}/api/stats') as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        
                        table = Table(title="Political Data Stream Statistics")
                        table.add_column("Metric", style="cyan")
                        table.add_column("Value", style="magenta")
                        
                        table.add_row("Active Streams", str(data['active_streams']))
                        table.add_row("Processed Count", str(data['processed_count']))
                        table.add_row("Average Sentiment", f"{data['avg_sentiment']:.3f}")
                        table.add_row("Crisis Alerts", str(data['crisis_alerts']))
                        
                        console.print(table)
                    else:
                        console.print("❌ [red]Failed to fetch statistics[/red]")
        except Exception as e:
            console.print(f"❌ [red]Error: {e}[/red]")
    
    asyncio.run(show_stats())

@cli.command()
@click.option('--host', default='localhost', help='Service host')
@click.option('--port', default=8000, help='Service port')
def test_alert(host, port):
    """Send test alert"""
    async def send_alert():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f'http://{host}:{port}/api/test-alert') as resp:
                    if resp.status == 200:
                        console.print("✅ [green]Test alert sent successfully[/green]")
                    else:
                        console.print("❌ [red]Failed to send test alert[/red]")
        except Exception as e:
            console.print(f"❌ [red]Error: {e}[/red]")
    
    asyncio.run(send_alert())

@cli.command()
@click.option('--host', default='localhost', help='Service host')
@click.option('--port', default=8000, help='Service port')
@click.option('--duration', default=60, help='Monitor duration in seconds')
def monitor(host, port, duration):
    """Real-time monitoring dashboard"""
    async def live_monitor():
        start_time = asyncio.get_event_loop().time()
        
        def create_dashboard():
            table = Table(title=f"Live Political Data Monitor - {datetime.now().strftime('%H:%M:%S')}")
            table.add_column("Metric", style="cyan")
            table.add_column("Value", style="magenta")
            table.add_column("Status", style="green")
            
            # This would be populated with real data in production
            table.add_row("Stream Status", "Active", "🟢")
            table.add_row("Processing Rate", "45/min", "🟢")
            table.add_row("Avg Response Time", "125ms", "🟢")
            table.add_row("Error Rate", "0.2%", "🟢")
            
            return table
        
        with Live(create_dashboard(), refresh_per_second=1) as live:
            while (asyncio.get_event_loop().time() - start_time) < duration:
                await asyncio.sleep(1)
                live.update(create_dashboard())
    
    console.print(f"[blue]Starting live monitor for {duration} seconds...[/blue]")
    asyncio.run(live_monitor())

if __name__ == '__main__':
    cli()