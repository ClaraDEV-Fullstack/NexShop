from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_remove_payment_card_brand_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='payer_name',
            field=models.CharField(blank=True, default='', max_length=120),
        ),
        migrations.AddField(
            model_name='payment',
            name='payer_phone',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
