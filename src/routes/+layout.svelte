<!-- @file src/routes/+layout.svelte -->
<script>
    import '../app.css';
    import AudioPlayer from '$lib/components/AudioPlayer.svelte';

</script>

<slot />
<AudioPlayer />


