#!/bin/sh

sha384_base64(){
    sha384sum "$1" | awk '{print $1}' | xxd -r -p | base64 --wrap=0 | tr '+/' '-_' | tr -d '='
}

image_checksum(){
    convert "$1" RGBA:- | sha384_base64 -
}

check_and_push(){
    filename="$1"
    ext="$2"
    original="$3"
    project_series="$4"
    project_type="$5"
    project_name="$6"
    filesize="$(stat -c%s "$filename")"
    checksum="$(image_checksum "$filename")"
    status="$?"
    # OLBgp1GsljhM2TJ-sbHjaiH9txEUvgdDTAzHv2P24donTt6_529l-9Ua0vFImLlb is the checksum of an empty file
    if ! [ "$status" = "0" ] || [ "$checksum" = "OLBgp1GsljhM2TJ-sbHjaiH9txEUvgdDTAzHv2P24donTt6_529l-9Ua0vFImLlb" ] || [ -z "$checksum" ] ; then
        rm >&2 -f -v -- "$filename"
        printf >&2 'image-checksum failed: %s\n' "$original"
        printf 'color: %s\nstatus: %s\nextra: %s\n' 'error' 'Invalid upload.' 'Unsupported file.'
        return 1
    fi
    dirname="/home/ubuntu/.config/deep-blue-sky/ranger/pr-data"
    # json manifest
    json_file="${dirname}/${checksum}.meta.json"
    # post file. creating it requests ranger to read the image
    post_file="${dirname}/${checksum}.meta.post"
    # ranger's metadata file
    disc_file="${dirname}/${checksum}.meta.disc"
    fullpath="${dirname}/${checksum}${ext}"
    if [ -f "$disc_file" ] ; then
        printf >&2 'Duplicate found: %s\n' "$checksum"
        rm >&2 -f -v -- "$filename"
        if [ -f "$post_file" ] ; then
            printf >&2 'Image not posted yet. Checksum: %s\n' "$checksum"
            printf 'color: %s\nstatus: %s\nextra: %s\n' 'warn' 'Please wait a moment.' "That image still hasn't been processed."
            return 0
        fi
        cached_series="$(jq <"$disc_file" '.["project-series"]' | tr -d '"')"
        cached_name="$(jq <"$disc_file" '.["project-name"]' | tr -d '"')"
        if [ "$cached_series" = "$project_series" ] && [ "$cached_name" = "$project_name" ] ; then
            printf >&2 'Duplicate is exact: %s\n' "$checksum"
            printf 'color: %s\nstatus: %s\nextra: %s\n' 'ok' 'Exact duplicate uploaded.' 'No action was performed.'
            return 0
        else
            printf 'color: %s\nstatus: %s\nextra: Project Series: %s, Project Name: %s\n' 'ok' 'Metadata updated.' "$project_series" "$project_name"
            printf >&2 'Reupload, changing metadata: %s\n' "$checksum"
        fi
    else
        printf 'color: %s\nstatus: %s\nextra: Project Series: %s, Project Name: %s\n' 'ok' 'Upload completed successfully.' "$project_series" "$project_name"
        printf >&2 'New image found: %s\n' "$checksum"
        mv >&2 -f -v -- "$filename" "$fullpath"
    fi
    now_time="$(date -u +%s)"
    printf '{}' |\
    jq --arg key 'checksum' --arg value "$checksum" '. | .[$key]=$value' |\
    jq --arg key 'original' --arg value "$original" '. | .[$key]=$value' |\
    jq --arg key 'extension' --arg value "$ext" '. | .[$key]=$value' |\
    jq --arg key 'filename' --arg value "${checksum}${ext}" '. | .[$key]=$value' |\
    jq --arg key 'dirname' --arg value "$dirname" '. | .[$key]=$value' |\
    jq --arg key 'project-series' --arg value "$project_series" '. | .[$key]=$value' |\
    jq --arg key 'project-type' --arg value "$project_type" '. | .[$key]=$value' |\
    jq --arg key 'project-name' --arg value "$project_name" '. | .[$key]=$value' |\
    jq --arg key 'mtime' --arg value "$now_time" '. | .[$key]=$value' |\
    jq --arg key 'crtime' --arg value "$now_time" '. | .[$key]=$value' |\
    jq --arg key 'size' --arg value "$filesize" '. | .[$key]=$value' |\
    jq -c '.' >"$json_file"
    touch -- "$post_file"
}

input_filename="$1"
original_filename="$2"
project_series="$3"
project_type="$4"
project_name="$5"
original_filename="${original_filename##*/}"
file_extension="${original_filename#"${original_filename%.*}"}"
check_and_push "$input_filename" "$file_extension" "$original_filename" "$project_series" "$project_type" "$project_name"
